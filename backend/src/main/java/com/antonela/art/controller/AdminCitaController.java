package com.antonela.art.controller;

import com.antonela.art.entity.Cita;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.service.NotificacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/appointments")
public class AdminCitaController {

    private static final Logger logger = LoggerFactory.getLogger(AdminCitaController.class);

    private final CitaRepository citaRepository;
    private final NotificacionService notificacionService;

    public AdminCitaController(CitaRepository citaRepository,
            NotificacionService notificacionService) {
        this.citaRepository = citaRepository;
        this.notificacionService = notificacionService;
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
