package com.antonela.art.controller;

import com.antonela.art.entity.Tarea;
import com.antonela.art.repository.TareaRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tasks")
public class AdminTareaController {

    private static final Logger logger = LoggerFactory.getLogger(AdminTareaController.class);

    private final TareaRepository tareaRepository;

    public AdminTareaController(TareaRepository tareaRepository) {
        this.tareaRepository = tareaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Tarea>> getAll(
            @RequestParam(required = false) Boolean completada) {
        if (completada != null) {
            return ResponseEntity.ok(tareaRepository.findByCompletadaOrderByCreadoEnDesc(completada));
        }
        return ResponseEntity.ok(tareaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Tarea tarea) {
        try {
            Tarea saved = tareaRepository.save(tarea);
            logger.info("Tarea creada: id={}", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error al crear tarea", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Tarea tarea) {
        return tareaRepository.findById(id)
                .map(existing -> {
                    existing.setDescripcion(tarea.getDescripcion());
                    existing.setCompletada(tarea.getCompletada());
                    Tarea saved = tareaRepository.save(existing);
                    logger.info("Tarea actualizada: id={}", saved.getId());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(existing -> {
                    existing.setCompletada(!existing.getCompletada());
                    Tarea saved = tareaRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!tareaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        tareaRepository.deleteById(id);
        logger.info("Tarea eliminada: id={}", id);
        return ResponseEntity.noContent().build();
    }
}
