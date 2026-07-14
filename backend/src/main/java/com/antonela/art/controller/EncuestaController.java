package com.antonela.art.controller;

import com.antonela.art.dto.EncuestaRequest;
import com.antonela.art.entity.Cita;
import com.antonela.art.entity.EncuestaSatisfaccion;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.EncuestaRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class EncuestaController {

    private static final Logger logger = LoggerFactory.getLogger(EncuestaController.class);

    private final EncuestaRepository encuestaRepository;
    private final CitaRepository citaRepository;

    public EncuestaController(EncuestaRepository encuestaRepository,
                              CitaRepository citaRepository) {
        this.encuestaRepository = encuestaRepository;
        this.citaRepository = citaRepository;
    }

    // Cliente: crear encuesta para una cita completada
    @PostMapping("/api/client/survey")
    public ResponseEntity<?> crearEncuesta(@Valid @RequestBody EncuestaRequest request,
                                           Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();

            Cita cita = citaRepository.findById(request.idCita())
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getCliente().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Esta cita no te pertenece"));
            }

            if (!"completada".equalsIgnoreCase(cita.getEstado())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo puedes calificar citas completadas"));
            }

            if (encuestaRepository.existsByCitaId(cita.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ya calificaste esta cita"));
            }

            EncuestaSatisfaccion encuesta = EncuestaSatisfaccion.builder()
                    .cita(cita)
                    .puntuacion(request.puntuacion())
                    .comentario(request.comentario())
                    .build();

            EncuestaSatisfaccion saved = encuestaRepository.save(encuesta);
            logger.info("Encuesta creada: cita {} puntuacion {} por cliente {}", request.idCita(), request.puntuacion(), idCliente);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error al crear encuesta", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Cliente: ver si ya califico una cita
    @GetMapping("/api/client/survey/check/{citaId}")
    public ResponseEntity<?> checkEncuesta(@PathVariable Long citaId, Authentication authentication) {
        boolean existe = encuestaRepository.existsByCitaId(citaId);
        return ResponseEntity.ok(Map.of("yaCalificado", existe));
    }

    // Admin: estadisticas de encuestas
    @GetMapping("/api/admin/survey/stats")
    public ResponseEntity<?> getStats() {
        Double promedio = encuestaRepository.promedioPuntuacion();
        Long satisfactorias = encuestaRepository.countSatisfactorias();
        Long total = encuestaRepository.countTotal();

        return ResponseEntity.ok(Map.of(
                "promedio", promedio != null ? Math.round(promedio * 100.0) / 100.0 : 0,
                "satisfactorias", satisfactorias != null ? satisfactorias : 0,
                "total", total != null ? total : 0
        ));
    }

    // Admin: listar todas las encuestas
    @GetMapping("/api/admin/survey")
    public ResponseEntity<List<EncuestaSatisfaccion>> getAll() {
        return ResponseEntity.ok(encuestaRepository.findAll());
    }
}
