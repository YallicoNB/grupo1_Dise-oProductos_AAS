package com.antonela.art.controller;

import com.antonela.art.entity.ImagenGaleria;
import com.antonela.art.entity.Servicio;
import com.antonela.art.repository.ImagenGaleriaRepository;
import com.antonela.art.repository.ServicioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/gallery")
public class AdminGaleriaController {

    private static final Logger logger = LoggerFactory.getLogger(AdminGaleriaController.class);

    private final ImagenGaleriaRepository imagenGaleriaRepository;
    private final ServicioRepository servicioRepository;

    public AdminGaleriaController(ImagenGaleriaRepository imagenGaleriaRepository,
                                  ServicioRepository servicioRepository) {
        this.imagenGaleriaRepository = imagenGaleriaRepository;
        this.servicioRepository = servicioRepository;
    }

    @GetMapping
    public ResponseEntity<List<ImagenGaleria>> getAll() {
        return ResponseEntity.ok(imagenGaleriaRepository.findAllByOrderByCategoriaAsc());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            String urlImagen = (String) body.get("urlImagen");
            String categoria = (String) body.get("categoria");
            String descripcion = (String) body.get("descripcion");
            Long idServicio = body.get("idServicio") != null
                    ? ((Number) body.get("idServicio")).longValue()
                    : null;

            if (urlImagen == null || urlImagen.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "urlImagen es requerido"));
            }

            ImagenGaleria imagen = ImagenGaleria.builder()
                    .urlImagen(urlImagen)
                    .categoria(categoria)
                    .descripcion(descripcion)
                    .build();

            if (idServicio != null) {
                Servicio servicio = servicioRepository.findById(idServicio)
                        .orElseThrow(() -> new RuntimeException("Servicio no encontrado: " + idServicio));
                imagen.setServicio(servicio);
            }

            ImagenGaleria saved = imagenGaleriaRepository.save(imagen);
            logger.info("Imagen de galeria creada: id={}", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error al crear imagen de galeria", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!imagenGaleriaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        imagenGaleriaRepository.deleteById(id);
        logger.info("Imagen de galeria eliminada: id={}", id);
        return ResponseEntity.noContent().build();
    }
}
