package com.antonela.art.service;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.Pago;
import com.antonela.art.repository.PagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class ServicioPago {

    private final PagoRepository pagoRepository;

    public ServicioPago(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    @Transactional
    public Pago procesarPago(Cita cita, Cliente cliente, String metodoPago) {
        if (!"efectivo".equals(metodoPago) && !"simulado_credito".equals(metodoPago)) {
            throw new IllegalArgumentException("Metodo de pago no valido: " + metodoPago);
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String randomSuffix = String.valueOf((int) (Math.random() * 1000));
        String idTransaccion = "SIM-" + timestamp + "-" + randomSuffix;

        BigDecimal monto = cita.getMontoPagado() != null ? cita.getMontoPagado()
                : cita.getServicio().getPrecioMinimo();

        Pago pago = Pago.builder()
                .cita(cita)
                .cliente(cliente)
                .metodoPago(metodoPago)
                .monto(monto)
                .estado("completado")
                .idTransaccionSimulada(idTransaccion)
                .build();

        return pagoRepository.save(pago);
    }
}
