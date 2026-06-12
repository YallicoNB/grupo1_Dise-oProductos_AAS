package com.antonela.art.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CrearCitaRequest(
        @NotNull(message = "El servicio es requerido") Long idServicio,

        @NotNull(message = "La fecha es requerida") @FutureOrPresent(message = "La fecha debe ser hoy o futura") LocalDate fecha,

        @NotNull(message = "La hora es requerida") LocalTime hora) {
}
