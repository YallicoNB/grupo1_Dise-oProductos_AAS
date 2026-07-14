package com.antonela.art.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record HistorialResumenDTO(
    long totalVisitas,
    BigDecimal totalGastado,
    String servicioFavorito,
    int frecuenciaDias,
    LocalDate primeraVisita,
    LocalDate ultimaVisita,
    List<VisitaDetalle> ultimasVisitas
) {
    public record VisitaDetalle(
        Long id,
        String servicio,
        LocalDate fecha,
        String hora,
        BigDecimal monto,
        String estado
    ) {}
}
