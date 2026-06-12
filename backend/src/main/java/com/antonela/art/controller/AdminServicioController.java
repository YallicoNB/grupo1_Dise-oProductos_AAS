package com.antonela.art.controller;

import com.antonela.art.entity.Servicio;
import com.antonela.art.repository.ServicioRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/services")
public class AdminServicioController {

    private static final Logger logger = LoggerFactory.getLogger(AdminServicioController.class);

    private final ServicioRepository servicioRepository;

    public AdminServicioController(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> getAll() {
        return ResponseEntity.ok(servicioRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return servicioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Servicio servicio) {
        try {
            Servicio saved = servicioRepository.save(servicio);
            logger.info("Servicio creado: {} (id={})", saved.getNombre(), saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error al crear servicio", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Servicio servicio) {
        return servicioRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(servicio.getNombre());
                    existing.setDescripcion(servicio.getDescripcion());
                    existing.setPrecioMinimo(servicio.getPrecioMinimo());
                    existing.setPrecioMaximo(servicio.getPrecioMaximo());
                    Servicio saved = servicioRepository.save(existing);
                    logger.info("Servicio actualizado: {} (id={})", saved.getNombre(), saved.getId());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!servicioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        servicioRepository.deleteById(id);
        logger.info("Servicio eliminado: id={}", id);
        return ResponseEntity.noContent().build();
    }
}
