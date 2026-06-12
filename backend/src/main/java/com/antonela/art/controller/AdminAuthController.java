package com.antonela.art.controller;

import com.antonela.art.dto.AuthResponse;
import com.antonela.art.dto.LoginAdminRequest;
import com.antonela.art.service.AutenticacionAdminService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthController.class);

    private final AutenticacionAdminService autenticacionAdminService;

    public AdminAuthController(AutenticacionAdminService autenticacionAdminService) {
        this.autenticacionAdminService = autenticacionAdminService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginAdminRequest request) {
        try {
            AuthResponse response = autenticacionAdminService.iniciarSesionAdmin(request);
            logger.info("Admin login exitoso: {}", request.nombreUsuario());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Admin login fallido: {} - {}", request.nombreUsuario(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
