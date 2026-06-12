package com.antonela.art.service;

import com.antonela.art.entity.NotificacionAdmin;
import com.antonela.art.entity.Pago;
import com.antonela.art.entity.Reembolso;
import com.antonela.art.repository.NotificacionAdminRepository;
import com.antonela.art.repository.ReembolsoRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ReembolsoService {

    private static final Logger logger = LoggerFactory.getLogger(ReembolsoService.class);

    private final ReembolsoRepository reembolsoRepository;
    private final NotificacionAdminRepository notificacionAdminRepository;

    public ReembolsoService(ReembolsoRepository reembolsoRepository,
                            NotificacionAdminRepository notificacionAdminRepository) {
        this.reembolsoRepository = reembolsoRepository;
        this.notificacionAdminRepository = notificacionAdminRepository;
    }

    @Transactional
    public Reembolso procesarReembolso(Pago pago, BigDecimal monto, int porcentaje) {
        try {
            String idTransaccion;
            boolean stripeOk = false;

            if ("stripe".equals(pago.getMetodoPago())
                    && pago.getIdTransaccionSimulada() != null
                    && pago.getIdTransaccionSimulada().startsWith("pi_")) {
                try {
                    RefundCreateParams params = RefundCreateParams.builder()
                            .setPaymentIntent(pago.getIdTransaccionSimulada())
                            .setAmount(monto.multiply(BigDecimal.valueOf(100)).longValue())
                            .build();
                    Refund refund = Refund.create(params);
                    idTransaccion = refund.getId();
                    stripeOk = true;
                    logger.info("Reembolso Stripe exitoso: {} para payment_intent {}",
                            refund.getId(), pago.getIdTransaccionSimulada());
                } catch (StripeException e) {
                    logger.error("Error al procesar reembolso Stripe: {}", e.getMessage());
                    idTransaccion = generarIdSimulado();
                    registrarErrorAdmin(pago, e.getMessage());
                }
            } else {
                idTransaccion = generarIdSimulado();
            }

            Reembolso reembolso = Reembolso.builder()
                    .cita(pago.getCita())
                    .pago(pago)
                    .montoReembolsado(monto)
                    .porcentajeReembolso(porcentaje)
                    .estado(stripeOk ? "procesado" : "simulado")
                    .idTransaccionSimulada(idTransaccion)
                    .procesadoEn(LocalDateTime.now())
                    .build();

            Reembolso guardado = reembolsoRepository.save(reembolso);
            logger.info("Reembolso {}: {} para pago {} (Stripe: {})",
                    stripeOk ? "procesado" : "simulado", idTransaccion, pago.getId(), stripeOk);

            notificacionAdminRepository.save(NotificacionAdmin.builder()
                    .tipo("reembolso_procesado")
                    .mensaje("Reembolso de S/ " + monto + " (" + porcentaje + "%) procesado para cita #"
                            + pago.getCita().getId() + " - " + (stripeOk ? "Stripe: " + idTransaccion : "Simulado"))
                    .leida(false)
                    .build());

            return guardado;
        } catch (Exception e) {
            logger.error("Error al procesar reembolso para pago {}", pago.getId(), e);
            notificacionAdminRepository.save(NotificacionAdmin.builder()
                    .tipo("ERROR_REEMBOLSO")
                    .mensaje("Error al procesar reembolso para pago " + pago.getId() + ": " + e.getMessage())
                    .leida(false)
                    .build());
            throw new RuntimeException("Error al procesar reembolso: " + e.getMessage());
        }
    }

    private String generarIdSimulado() {
        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        return "SIM-REF-" + timestamp + "-" + randomSuffix;
    }

    private void registrarErrorAdmin(Pago pago, String mensaje) {
        notificacionAdminRepository.save(NotificacionAdmin.builder()
                .tipo("STRIPE_REFUND_ERROR")
                .mensaje("Error en reembolso Stripe para pago " + pago.getId()
                        + " (" + pago.getIdTransaccionSimulada() + "): " + mensaje
                        + ". Se generó reembolso simulado.")
                .leida(false)
                .build());
    }
}
