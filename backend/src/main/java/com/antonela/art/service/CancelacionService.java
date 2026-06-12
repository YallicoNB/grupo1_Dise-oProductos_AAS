package com.antonela.art.service;

import com.antonela.art.entity.Cita;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class CancelacionService {

    public int calcularPorcentajeReembolso(Cita cita) {
        LocalDateTime fechaHoraCita = LocalDateTime.of(cita.getFechaCita(), cita.getHoraCita());
        LocalDateTime ahora = LocalDateTime.now();

        if (fechaHoraCita.isBefore(ahora)) {
            return 0;
        }

        long horasRestantes = ChronoUnit.HOURS.between(ahora, fechaHoraCita);
        boolean mismoDia = cita.getFechaCita().equals(LocalDate.now());

        if (mismoDia) {
            return 0;
        } else if (horasRestantes < 24) {
            return 50;
        } else {
            return 100;
        }
    }

    public BigDecimal calcularMontoReembolso(Cita cita) {
        int porcentaje = calcularPorcentajeReembolso(cita);
        BigDecimal montoOriginal = cita.getMontoPagado() != null ? cita.getMontoPagado()
                : cita.getServicio().getPrecioMinimo();
        return montoOriginal.multiply(BigDecimal.valueOf(porcentaje))
                .divide(BigDecimal.valueOf(100));
    }
}
