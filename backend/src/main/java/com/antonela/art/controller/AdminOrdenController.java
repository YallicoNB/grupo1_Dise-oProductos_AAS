package com.antonela.art.controller;

import com.antonela.art.entity.OrdenCompra;
import com.antonela.art.repository.OrdenCompraRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrdenController {

    private static final Logger logger = LoggerFactory.getLogger(AdminOrdenController.class);

    private final OrdenCompraRepository ordenCompraRepository;

    public AdminOrdenController(OrdenCompraRepository ordenCompraRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
    }

    @GetMapping
    public ResponseEntity<List<OrdenCompra>> getAll() {
        List<OrdenCompra> ordenes = ordenCompraRepository.findAllByOrderByCreadoEnDesc();
        return ResponseEntity.ok(ordenes);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El campo 'estado' es requerido"));
        }
        return ordenCompraRepository.findById(id)
                .map(orden -> {
                    orden.setEstado(nuevoEstado);
                    ordenCompraRepository.save(orden);
                    logger.info("Orden {} actualizada a estado '{}'", id, nuevoEstado);
                    return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado a " + nuevoEstado));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
