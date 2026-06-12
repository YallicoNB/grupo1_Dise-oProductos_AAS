package com.antonela.art.controller;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ClienteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/client")
public class ClienteController {

    private static final Logger logger = LoggerFactory.getLogger(ClienteController.class);

    private final ClienteRepository clienteRepository;
    private final CitaRepository citaRepository;

    public ClienteController(ClienteRepository clienteRepository, CitaRepository citaRepository) {
        this.clienteRepository = clienteRepository;
        this.citaRepository = citaRepository;
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
}
