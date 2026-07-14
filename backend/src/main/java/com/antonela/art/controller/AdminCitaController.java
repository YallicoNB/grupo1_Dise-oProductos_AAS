package com.antonela.art.controller;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.SeguimientoTiempo;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.SeguimientoTiempoRepository;
import com.antonela.art.service.NotificacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/appointments")
public class AdminCitaController {

    private static final Logger logger = LoggerFactory.getLogger(AdminCitaController.class);

    private final CitaRepository citaRepository;
    private final NotificacionService notificacionService;
    private final SeguimientoTiempoRepository seguimientoTiempoRepository;

    public AdminCitaController(CitaRepository citaRepository,
            NotificacionService notificacionService,
            SeguimientoTiempoRepository seguimientoTiempoRepository) {
        this.citaRepository = citaRepository;
        this.notificacionService = notificacionService;
        this.seguimientoTiempoRepository = seguimientoTiempoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Cita>> getAll(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta) {
        if (desde != null && hasta != null) {
            return ResponseEntity.ok(citaRepository.findByFechaCitaBetweenOrderByFechaCitaAscHoraCitaAsc(desde, hasta));
        }
        if (desde != null) {
            return ResponseEntity.ok(citaRepository.findByFechaCitaBetweenOrderByFechaCitaAscHoraCitaAsc(desde, desde.plusMonths(1)));
        }
        return ResponseEntity.ok(citaRepository.findAll());
    }

    @GetMapping("/{id}/time")
    public ResponseEntity<?> getTimeTracking(@PathVariable Long id) {
        return seguimientoTiempoRepository.findByCitaId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Map.of("activo", false)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startService(@PathVariable Long id) {
        return citaRepository.findById(id)
                .map(cita -> {
                    if (seguimientoTiempoRepository.existsByCitaId(id)) {
                        return ResponseEntity.badRequest().body(Map.of("error", "El servicio ya fue iniciado"));
                    }
                    SeguimientoTiempo st = SeguimientoTiempo.builder()
                            .cita(cita)
                            .horaInicio(LocalDateTime.now())
                            .build();
                    seguimientoTiempoRepository.save(st);
                    logger.info("Servicio iniciado para cita {}", id);
                    return ResponseEntity.ok(Map.of("mensaje", "Servicio iniciado", "horaInicio", LocalDateTime.now().toString()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeService(@PathVariable Long id) {
        return seguimientoTiempoRepository.findByCitaId(id)
                .map(st -> {
                    if (st.getHoraFin() != null) {
                        return ResponseEntity.badRequest().body(Map.of("error", "El servicio ya fue finalizado"));
                    }
                    st.setHoraFin(LocalDateTime.now());
                    long diffMin = Duration.between(st.getHoraInicio(), st.getHoraFin()).toMinutes();
                    st.setDiferenciaMinutos((int) diffMin);

                    Integer duracionEstimada = st.getCita().getServicio().getDuracionMinutos();
                    if (duracionEstimada != null && duracionEstimada > 0) {
                        st.setCompletadoATiempo(diffMin <= duracionEstimada);
                    } else {
                        st.setCompletadoATiempo(true);
                    }

                    seguimientoTiempoRepository.save(st);
                    logger.info("Servicio finalizado para cita {}: {}min (estimado: {}min)", id, diffMin, duracionEstimada);
                    return ResponseEntity.ok(Map.of(
                            "mensaje", "Servicio finalizado",
                            "diferenciaMinutos", diffMin,
                            "completadoATiempo", st.getCompletadoATiempo()
                    ));
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("error", "El servicio no ha sido iniciado")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return citaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return citaRepository.findById(id)
                .map(cita -> {
                    String nuevoEstado = body.get("estado");
                    if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                        return ResponseEntity.badRequest().body(Map.of("error", "estado es requerido"));
                    }
                    String estadoAnterior = cita.getEstado();
                    cita.setEstado(nuevoEstado);
                    Cita saved = citaRepository.save(cita);
                    logger.info("Cita {} actualizada a estado: {}", id, nuevoEstado);

                    try {
                        if ("cancelada".equalsIgnoreCase(nuevoEstado)) {
                            notificacionService.enviarCancelacionCita(saved, "Cancelado por administrador");
                        } else if ("confirmada".equalsIgnoreCase(nuevoEstado)
                                && !"confirmada".equalsIgnoreCase(estadoAnterior)) {
                            notificacionService.enviarConfirmacionCita(saved);
                        }
                    } catch (Exception e) {
                        logger.error("Error al enviar notificación de cambio de estado: {}", e.getMessage());
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> reschedule(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return citaRepository.findById(id)
                .map(cita -> {
                    LocalDate fechaAnterior = cita.getFechaCita();
                    LocalTime horaAnterior = cita.getHoraCita();
                    LocalDate nuevaFecha = body.containsKey("fecha")
                            ? LocalDate.parse(body.get("fecha")) : cita.getFechaCita();
                    LocalTime nuevaHora = body.containsKey("hora")
                            ? LocalTime.parse(body.get("hora")) : cita.getHoraCita();

                    cita.setFechaCita(nuevaFecha);
                    cita.setHoraCita(nuevaHora);
                    Cita saved = citaRepository.save(cita);
                    logger.info("Cita {} reprogramada a {} {}", id, nuevaFecha, nuevaHora);

                    try {
                        notificacionService.enviarReagendamientoCita(saved, fechaAnterior, horaAnterior);
                    } catch (Exception e) {
                        logger.error("Error al enviar notificación de reagendamiento: {}", e.getMessage());
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
