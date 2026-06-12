package com.antonela.art.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginClienteRequest(
    @NotBlank @Email(message = "Correo electronico invalido")
    String correoElectronico,

    @NotBlank(message = "La contrasena es obligatoria")
    String contrasena
) {}
