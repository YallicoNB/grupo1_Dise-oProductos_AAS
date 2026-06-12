package com.antonela.art.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RestablecerContrasenaRequest(
    @NotBlank(message = "El token es obligatorio")
    String token,

    @NotBlank @Size(min = 8, message = "La contrasena debe tener al menos 8 caracteres")
    String nuevaContrasena
) {}
