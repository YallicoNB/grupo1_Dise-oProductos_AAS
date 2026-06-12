package com.antonela.art.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginAdminRequest(
    @NotBlank(message = "El nombre de usuario es obligatorio")
    String nombreUsuario,

    @NotBlank(message = "La contrasena es obligatoria")
    String contrasena
) {}
