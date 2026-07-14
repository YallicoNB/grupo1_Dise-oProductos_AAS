package com.antonela.art.controller;

import com.antonela.art.dto.ComentarioRequest;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.Comentario;
import com.antonela.art.entity.NotificacionAdmin;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.repository.ComentarioRepository;
import com.antonela.art.repository.NotificacionAdminRepository;
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
@RequestMapping("/api/client/comments")
public class ComentarioClienteController {

    private static final Logger logger = LoggerFactory.getLogger(ComentarioClienteController.class);

    private final ComentarioRepository comentarioRepository;
    private final ClienteRepository clienteRepository;
    private final NotificacionAdminRepository notificacionAdminRepository;

    public ComentarioClienteController(ComentarioRepository comentarioRepository,
                                       ClienteRepository clienteRepository,
                                       NotificacionAdminRepository notificacionAdminRepository) {
        this.comentarioRepository = comentarioRepository;
        this.clienteRepository = clienteRepository;
        this.notificacionAdminRepository = notificacionAdminRepository;
    }

    @PostMapping
    public ResponseEntity<?> crearComentario(@Valid @RequestBody ComentarioRequest request,
                                              Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            Cliente cliente = clienteRepository.findById(idCliente)
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

            Comentario comentario = Comentario.builder()
                    .cliente(cliente)
                    .mensaje(request.mensaje())
                    .estado("enviado")
                    .build();

            Comentario saved = comentarioRepository.save(comentario);
            logger.info("Comentario creado por cliente {}: {}", idCliente, saved.getId());

            notificacionAdminRepository.save(NotificacionAdmin.builder()
                    .tipo("comentario_nuevo")
                    .mensaje("Nuevo comentario de " + cliente.getNombreCompleto() + ": " + request.mensaje())
                    .leida(false)
                    .build());

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error al crear comentario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMisComentarios(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            List<Comentario> comentarios = comentarioRepository.findByClienteIdOrderByCreadoEnDesc(idCliente);
            return ResponseEntity.ok(comentarios);
        } catch (Exception e) {
            logger.error("Error al obtener comentarios", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
