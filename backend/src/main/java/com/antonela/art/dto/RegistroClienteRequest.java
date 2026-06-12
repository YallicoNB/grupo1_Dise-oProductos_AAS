package com.antonela.art.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroClienteRequest(
    @NotBlank(message = "El nombre completo es obligatorio")
    String nombreCompleto,

    @NotBlank @Email(message = "Correo electronico invalido")
    String correoElectronico,

    @NotBlank(message = "El telefono es obligatorio")
    String telefono,

    @NotBlank @Size(min = 8, message = "La contrasena debe tener al menos 8 caracteres")
    String contrasena
) {}
