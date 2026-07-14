package com.antonela.art.controller;

import com.antonela.art.dto.HistorialResumenDTO;
import com.antonela.art.dto.HistorialResumenDTO.VisitaDetalle;
import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.service.RecomendacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client")
public class ClienteController {

    private static final Logger logger = LoggerFactory.getLogger(ClienteController.class);

    private final ClienteRepository clienteRepository;
    private final CitaRepository citaRepository;
    private final RecomendacionService recomendacionService;

    public ClienteController(ClienteRepository clienteRepository, CitaRepository citaRepository,
                             RecomendacionService recomendacionService) {
        this.clienteRepository = clienteRepository;
        this.citaRepository = citaRepository;
        this.recomendacionService = recomendacionService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            Cliente cliente = clienteRepository.findById(idCliente)
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            logger.error("Error al obtener perfil", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            Cliente cliente = clienteRepository.findById(idCliente)
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

            String nombreCompleto = request.get("nombreCompleto");
            String correoElectronico = request.get("correoElectronico");
            String telefono = request.get("telefono");

            if (nombreCompleto == null || nombreCompleto.trim().isEmpty() ||
                    correoElectronico == null || correoElectronico.trim().isEmpty() ||
                    telefono == null || telefono.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son requeridos"));
            }

            // Validar que el correo no esté ocupado por otro usuario
            Optional<Cliente> existing = clienteRepository.findByCorreoElectronico(correoElectronico);
            if (existing.isPresent() && !existing.get().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "El correo electronico ya esta registrado"));
            }

            cliente.setNombreCompleto(nombreCompleto);
            cliente.setCorreoElectronico(correoElectronico);
            cliente.setTelefono(telefono);

            Cliente saved = clienteRepository.save(cliente);
            logger.info("Perfil del cliente {} actualizado exitosamente", idCliente);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error al actualizar perfil", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            List<Cita> citas = citaRepository.findByClienteIdOrderByFechaCitaAscHoraCitaAsc(idCliente);
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            logger.error("Error al obtener citas del cliente", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/summary")
    public ResponseEntity<?> getHistorySummary(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            List<Cita> todas = citaRepository.findByClienteIdOrderByFechaCitaAscHoraCitaAsc(idCliente);
            List<Cita> completadas = todas.stream()
                    .filter(c -> "completada".equalsIgnoreCase(c.getEstado()))
                    .toList();

            if (completadas.isEmpty()) {
                return ResponseEntity.ok(new HistorialResumenDTO(
                        0, BigDecimal.ZERO, "—", 0, null, null, List.of()));
            }

            long totalVisitas = completadas.size();
            BigDecimal totalGastado = completadas.stream()
                    .map(c -> c.getMontoPagado() != null ? c.getMontoPagado() : c.getServicio().getPrecioMinimo())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Servicio mas frecuente
            Map<String, Long> freq = completadas.stream()
                    .collect(Collectors.groupingBy(c -> c.getServicio().getNombre(), Collectors.counting()));
            String servicioFavorito = freq.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("—");

            LocalDate primera = completadas.get(0).getFechaCita();
            LocalDate ultima = completadas.get(completadas.size() - 1).getFechaCita();
            long diasEntre = ChronoUnit.DAYS.between(primera, ultima);
            int frecuenciaDias = totalVisitas > 1 && diasEntre > 0
                    ? (int) (diasEntre / (totalVisitas - 1))
                    : 0;

            // Ultimas 5 visitas
            List<VisitaDetalle> ultimas = completadas.stream()
                    .sorted(Comparator.comparing(Cita::getFechaCita).reversed())
                    .limit(5)
                    .map(c -> new VisitaDetalle(
                            c.getId(),
                            c.getServicio().getNombre(),
                            c.getFechaCita(),
                            c.getHoraCita(),
                            c.getMontoPagado() != null ? c.getMontoPagado() : c.getServicio().getPrecioMinimo(),
                            c.getEstado()))
                    .toList();

            return ResponseEntity.ok(new HistorialResumenDTO(
                    totalVisitas, totalGastado, servicioFavorito, frecuenciaDias, primera, ultima, ultimas));
        } catch (Exception e) {
            logger.error("Error al obtener resumen de historial", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            List<Map<String, Object>> recomendaciones = recomendacionService.obtenerRecomendaciones(idCliente);
            return ResponseEntity.ok(recomendaciones);
        } catch (Exception e) {
            logger.error("Error al obtener recomendaciones", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
