package com.antonela.art.controller;

import com.antonela.art.entity.ImagenGaleria;
import com.antonela.art.entity.Producto;
import com.antonela.art.entity.Servicio;
import com.antonela.art.repository.ImagenGaleriaRepository;
import com.antonela.art.repository.ProductoRepository;
import com.antonela.art.repository.ServicioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogoController {

    private static final Logger logger = LoggerFactory.getLogger(CatalogoController.class);

    private final ServicioRepository servicioRepository;
    private final ProductoRepository productoRepository;
    private final ImagenGaleriaRepository imagenGaleriaRepository;

    public CatalogoController(ServicioRepository servicioRepository,
                              ProductoRepository productoRepository,
                              ImagenGaleriaRepository imagenGaleriaRepository) {
        this.servicioRepository = servicioRepository;
        this.productoRepository = productoRepository;
        this.imagenGaleriaRepository = imagenGaleriaRepository;
    }

    @GetMapping("/services")
    public ResponseEntity<List<Servicio>> getServicios() {
        logger.info("Solicitando catalogo de servicios");
        List<Servicio> servicios = servicioRepository.findAll();
        return ResponseEntity.ok(servicios);
    }

        @GetMapping("/products")
        public ResponseEntity<List<Producto>> getProductos(
                @RequestParam(value = "disponible", required = false) Boolean disponible) {
            logger.info("Solicitando catalogo de productos con disponible={}", disponible);
            List<Producto> productos;
            if (Boolean.TRUE.equals(disponible)) {
                productos = productoRepository.findByDisponibleTrue();
            } else {
                productos = productoRepository.findAll();
            }
            return ResponseEntity.ok(productos);
        }

    @GetMapping("/gallery")
    public ResponseEntity<List<ImagenGaleria>> getGallery() {
        logger.info("Solicitando galeria de imagenes");
        List<ImagenGaleria> imagenes = imagenGaleriaRepository.findAll();
        return ResponseEntity.ok(imagenes);
    }
}
