package com.antonela.art.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EncuestaRequest(
        @NotNull(message = "El id de la cita es requerido") Long idCita,

        @NotNull(message = "La puntuacion es requerida")
        @Min(value = 1, message = "La puntuacion minima es 1")
        @Max(value = 5, message = "La puntuacion maxima es 5")
        Integer puntuacion,

        String comentario
) {}
