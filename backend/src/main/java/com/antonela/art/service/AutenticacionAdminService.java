package com.antonela.art.service;

import com.antonela.art.dto.AuthResponse;
import com.antonela.art.dto.LoginAdminRequest;
import com.antonela.art.entity.UsuarioAdmin;
import com.antonela.art.repository.UsuarioAdminRepository;
import com.antonela.art.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AutenticacionAdminService {

    private static final Logger logger = LoggerFactory.getLogger(AutenticacionAdminService.class);

    private final UsuarioAdminRepository usuarioAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AutenticacionAdminService(UsuarioAdminRepository usuarioAdminRepository,
                                     PasswordEncoder passwordEncoder,
                                     JwtUtil jwtUtil) {
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse iniciarSesionAdmin(LoginAdminRequest request) {
        logger.info("Intento de login admin para usuario: {}", request.nombreUsuario());

        UsuarioAdmin admin = usuarioAdminRepository.findByNombreUsuario(request.nombreUsuario())
                .orElseThrow(() -> {
                    logger.warn("Admin no encontrado: {}", request.nombreUsuario());
                    return new RuntimeException("Credenciales invalidas");
                });

        if (!passwordEncoder.matches(request.contrasena(), admin.getContrasenaHash())) {
            logger.warn("Contrasena incorrecta para admin: {}", request.nombreUsuario());
            throw new RuntimeException("Credenciales invalidas");
        }

        String token = jwtUtil.generarToken(admin.getId(), admin.getNombreUsuario(), admin.getRol());
        logger.info("Login exitoso para admin: {}", request.nombreUsuario());

        return new AuthResponse(token, null, admin);
    }
}
