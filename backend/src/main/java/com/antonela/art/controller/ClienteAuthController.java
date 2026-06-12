package com.antonela.art.controller;

import com.antonela.art.dto.*;
import com.antonela.art.service.AutenticacionClienteService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/client")
public class ClienteAuthController {

    private static final Logger logger = LoggerFactory.getLogger(ClienteAuthController.class);

    private final AutenticacionClienteService autenticacionClienteService;

    public ClienteAuthController(AutenticacionClienteService autenticacionClienteService) {
        this.autenticacionClienteService = autenticacionClienteService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistroClienteRequest request) {
        try {
            AuthResponse response = autenticacionClienteService.registrarCliente(request);
            logger.info("Cliente registrado: {}", request.correoElectronico());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            logger.warn("Registro fallido: {} - {}", request.correoElectronico(), e.getMessage());
            if ("El correo electronico ya esta registrado".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginClienteRequest request) {
        try {
            AuthResponse response = autenticacionClienteService.iniciarSesionCliente(request);
            logger.info("Cliente login exitoso: {}", request.correoElectronico());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Cliente login fallido: {} - {}", request.correoElectronico(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody SolicitudRecuperacionRequest request) {
        RecuperacionResponse response = autenticacionClienteService.solicitarRecuperacionContrasena(request);
        logger.info("Solicitud de recuperacion procesada para: {}", request.correoElectronico());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam("token") String token) {
        try {
            autenticacionClienteService.validarTokenRecuperacion(token);
            return ResponseEntity.ok(Map.of("valido", true));
        } catch (RuntimeException e) {
            logger.warn("Validacion de token fallida: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody RestablecerContrasenaRequest request) {
        try {
            autenticacionClienteService.restablecerContrasena(request);
            logger.info("Contrasena restablecida exitosamente");
            return ResponseEntity.ok(Map.of("mensaje", "Contrasena restablecida exitosamente"));
        } catch (RuntimeException e) {
            logger.warn("Restablecimiento fallido: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
