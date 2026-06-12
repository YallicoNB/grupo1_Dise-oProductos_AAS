package com.antonela.art.controller;

import com.antonela.art.entity.Producto;
import com.antonela.art.repository.ProductoRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductoController {

    private static final Logger logger = LoggerFactory.getLogger(AdminProductoController.class);

    private final ProductoRepository productoRepository;

    public AdminProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> getAll() {
        return ResponseEntity.ok(productoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Producto producto) {
        try {
            Producto saved = productoRepository.save(producto);
            logger.info("Producto creado: {} (id={})", saved.getNombre(), saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error al crear producto", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        return productoRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(producto.getNombre());
                    existing.setDescripcion(producto.getDescripcion());
                    existing.setPrecio(producto.getPrecio());
                    existing.setUrlImagen(producto.getUrlImagen());
                    existing.setDisponible(producto.getDisponible());
                    Producto saved = productoRepository.save(existing);
                    logger.info("Producto actualizado: {} (id={})", saved.getNombre(), saved.getId());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/disponible")
    public ResponseEntity<?> toggleDisponible(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return productoRepository.findById(id)
                .map(existing -> {
                    existing.setDisponible(body.getOrDefault("disponible", !existing.getDisponible()));
                    Producto saved = productoRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productoRepository.deleteById(id);
        logger.info("Producto eliminado: id={}", id);
        return ResponseEntity.noContent().build();
    }
}
