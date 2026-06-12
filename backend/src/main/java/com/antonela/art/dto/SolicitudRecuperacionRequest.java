package com.antonela.art.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SolicitudRecuperacionRequest(
    @NotBlank @Email(message = "Correo electronico invalido")
    String correoElectronico
) {}
