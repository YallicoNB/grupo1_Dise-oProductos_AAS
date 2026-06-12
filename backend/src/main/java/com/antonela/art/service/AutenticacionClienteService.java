package com.antonela.art.service;

import com.antonela.art.dto.*;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.TokenRecuperacionContrasena;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.repository.TokenRecuperacionContrasenaRepository;
import com.antonela.art.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AutenticacionClienteService {

    private static final Logger logger = LoggerFactory.getLogger(AutenticacionClienteService.class);

    private final ClienteRepository clienteRepository;
    private final TokenRecuperacionContrasenaRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AutenticacionClienteService(ClienteRepository clienteRepository,
                                       TokenRecuperacionContrasenaRepository tokenRepository,
                                       PasswordEncoder passwordEncoder,
                                       JwtUtil jwtUtil) {
        this.clienteRepository = clienteRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse registrarCliente(RegistroClienteRequest request) {
        logger.info("Registro de nuevo cliente: {}", request.correoElectronico());

        if (clienteRepository.existsByCorreoElectronico(request.correoElectronico())) {
            logger.warn("Correo ya registrado: {}", request.correoElectronico());
            throw new RuntimeException("El correo electronico ya esta registrado");
        }

        Cliente cliente = new Cliente();
        cliente.setNombreCompleto(request.nombreCompleto());
        cliente.setCorreoElectronico(request.correoElectronico());
        cliente.setTelefono(request.telefono());
        cliente.setContrasenaHash(passwordEncoder.encode(request.contrasena()));
        cliente.setVersionContrasena(1);

        cliente = clienteRepository.save(cliente);

        String token = jwtUtil.generarToken(cliente.getId(), cliente.getCorreoElectronico(), "cliente");
        logger.info("Cliente registrado exitosamente: {}", request.correoElectronico());

        return new AuthResponse(token, cliente, null);
    }

    public AuthResponse iniciarSesionCliente(LoginClienteRequest request) {
        logger.info("Intento de login cliente: {}", request.correoElectronico());

        Cliente cliente = clienteRepository.findByCorreoElectronico(request.correoElectronico())
                .orElseThrow(() -> {
                    logger.warn("Cliente no encontrado: {}", request.correoElectronico());
                    return new RuntimeException("Credenciales invalidas");
                });

        if (!passwordEncoder.matches(request.contrasena(), cliente.getContrasenaHash())) {
            logger.warn("Contrasena incorrecta para cliente: {}", request.correoElectronico());
            throw new RuntimeException("Credenciales invalidas");
        }

        String token = jwtUtil.generarToken(cliente.getId(), cliente.getCorreoElectronico(), "cliente");
        logger.info("Login exitoso para cliente: {}", request.correoElectronico());

        return new AuthResponse(token, cliente, null);
    }

    @Transactional
    public RecuperacionResponse solicitarRecuperacionContrasena(SolicitudRecuperacionRequest request) {
        String mensajeGenerico = "Si el correo existe, recibira un enlace de restablecimiento.";

        var clienteOpt = clienteRepository.findByCorreoElectronico(request.correoElectronico());

        if (clienteOpt.isEmpty()) {
            logger.info("Solicitud de recuperacion para correo no registrado (oculto): {}", request.correoElectronico());
            return new RecuperacionResponse(mensajeGenerico, null);
        }

        Cliente cliente = clienteOpt.get();

        // Invalidar tokens anteriores no usados
        tokenRepository.findByClienteIdAndUsadoFalse(cliente.getId())
                .ifPresent(t -> {
                    t.setUsado(true);
                    tokenRepository.save(t);
                });

        // Generar nuevo token
        String tokenStr = UUID.randomUUID().toString();
        TokenRecuperacionContrasena tokenEntity = new TokenRecuperacionContrasena();
        tokenEntity.setCliente(cliente);
        tokenEntity.setToken(tokenStr);
        tokenEntity.setUsado(false);
        tokenEntity.setExpiraEn(LocalDateTime.now().plusHours(1));

        tokenRepository.save(tokenEntity);

        String enlace = "http://localhost:3000/reset-password?token=" + tokenStr;
        logger.info("Token de recuperacion generado para {}: {}", request.correoElectronico(), enlace);

        return new RecuperacionResponse(mensajeGenerico, enlace);
    }

    public void validarTokenRecuperacion(String token) {
        TokenRecuperacionContrasena tokenEntity = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalido"));

        if (tokenEntity.getUsado()) {
            throw new RuntimeException("El token ya ha sido usado");
        }

        if (tokenEntity.estaExpirado()) {
            throw new RuntimeException("El token ha expirado");
        }
    }

    @Transactional
    public void restablecerContrasena(RestablecerContrasenaRequest request) {
        logger.info("Intento de restablecimiento de contrasena");

        TokenRecuperacionContrasena tokenEntity = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new RuntimeException("Token invalido"));

        if (tokenEntity.getUsado()) {
            throw new RuntimeException("El token ya ha sido usado");
        }

        if (tokenEntity.estaExpirado()) {
            throw new RuntimeException("El token ha expirado");
        }

        Cliente cliente = tokenEntity.getCliente();
        cliente.setContrasenaHash(passwordEncoder.encode(request.nuevaContrasena()));
        cliente.incrementarVersionContrasena();
        clienteRepository.save(cliente);

        tokenEntity.setUsado(true);
        tokenRepository.save(tokenEntity);

        logger.info("Contrasena restablecida exitosamente para cliente: {}", cliente.getCorreoElectronico());
        logger.info("Confirmacion de restablecimiento registrada en logs para: {}", cliente.getCorreoElectronico());
    }
}
