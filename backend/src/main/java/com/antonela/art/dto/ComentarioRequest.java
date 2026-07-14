package com.antonela.art.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioRequest(
        @NotBlank(message = "El mensaje no puede estar vacio")
        @Size(max = 1000, message = "El mensaje no puede exceder 1000 caracteres")
        String mensaje
) {}
