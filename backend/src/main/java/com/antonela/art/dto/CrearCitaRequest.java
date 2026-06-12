package com.antonela.art.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CrearCitaRequest(
        @NotNull(message = "El servicio es requerido") Long idServicio,

        @NotNull(message = "La fecha es requerida") @Future(message = "La fecha debe ser futura") LocalDate fecha,

        @NotNull(message = "La hora es requerida") LocalTime hora) {
}
