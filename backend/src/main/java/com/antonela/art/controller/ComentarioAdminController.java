package com.antonela.art.controller;

import com.antonela.art.entity.Comentario;
import com.antonela.art.repository.ComentarioRepository;
import com.antonela.art.service.NotificacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/comments")
public class ComentarioAdminController {

    private static final Logger logger = LoggerFactory.getLogger(ComentarioAdminController.class);

    private final ComentarioRepository comentarioRepository;
    private final NotificacionService notificacionService;

    public ComentarioAdminController(ComentarioRepository comentarioRepository,
                                     NotificacionService notificacionService) {
        this.comentarioRepository = comentarioRepository;
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public ResponseEntity<List<Comentario>> getAll(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(comentarioRepository.findByEstadoOrderByCreadoEnDesc(estado));
        }
        return ResponseEntity.ok(comentarioRepository.findAllByOrderByCreadoEnDesc());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return comentarioRepository.findById(id)
                .map(comentario -> {
                    if ("enviado".equals(comentario.getEstado())) {
                        comentario.setEstado("leido");
                        comentarioRepository.save(comentario);
                        logger.info("Comentario {} marcado como leido", id);
                    }
                    return ResponseEntity.ok(Map.of("mensaje", "ok"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String respuesta = body.get("respuesta");
        if (respuesta == null || respuesta.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La respuesta es requerida"));
        }
        return comentarioRepository.findById(id)
                .map(comentario -> {
                    comentario.setEstado("respondido");
                    comentario.setRespuestaAdmin(respuesta.trim());
                    comentario.setRespondidoEn(LocalDateTime.now());
                    Comentario saved = comentarioRepository.save(comentario);
                    logger.info("Comentario {} respondido por admin", id);
                    try {
                        notificacionService.enviarRespuestaComentario(saved);
                    } catch (Exception e) {
                        logger.error("Error al enviar notificacion de respuesta: {}", e.getMessage());
                    }
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
