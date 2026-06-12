package com.antonela.art.controller;

import com.antonela.art.dto.CrearCitaRequest;
import com.antonela.art.dto.FranjaHorariaDTO;
import com.antonela.art.entity.Cita;
import com.antonela.art.service.ReservaService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class ReservaController {

    private static final Logger logger = LoggerFactory.getLogger(ReservaController.class);

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam(value = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "idServicio", required = false) Long idServicio,
            @RequestParam(value = "serviceId", required = false) Long serviceId) {

        LocalDate selectedFecha = (fecha != null) ? fecha : date;
        Long selectedIdServicio = (idServicio != null) ? idServicio : serviceId;

        if (selectedFecha == null || selectedIdServicio == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "La fecha y el servicio son requeridos"));
        }

        try {
            List<FranjaHorariaDTO> slots = reservaService.obtenerFranjasDisponibles(selectedFecha, selectedIdServicio);
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            logger.warn("Error al obtener franjas disponibles: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crearCita(@Valid @RequestBody CrearCitaRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }

        try {
            Long idCliente = (Long) authentication.getPrincipal();
            Cita cita = reservaService.crearCita(idCliente, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(cita);
        } catch (RuntimeException e) {
            logger.warn("Error al crear cita: {}", e.getMessage());
            if (e.getMessage().contains("no está disponible") || e.getMessage().contains("ya está ocupada")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
