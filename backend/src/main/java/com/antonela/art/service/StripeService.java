package com.antonela.art.service;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.OrdenCompra;
import com.antonela.art.entity.Pago;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.OrdenCompraRepository;
import com.antonela.art.repository.PagoRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class StripeService {

    private static final Logger logger = LoggerFactory.getLogger(StripeService.class);

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final OrdenCompraRepository ordenRepository;
    private final PagoRepository pagoRepository;
    private final CitaRepository citaRepository;
    private final NotificacionService notificacionService;

    private boolean stripeInicializado = false;

    public StripeService(OrdenCompraRepository ordenRepository,
                         PagoRepository pagoRepository,
                         CitaRepository citaRepository,
                         NotificacionService notificacionService) {
        this.ordenRepository = ordenRepository;
        this.pagoRepository = pagoRepository;
        this.citaRepository = citaRepository;
        this.notificacionService = notificacionService;
    }

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.equals("sk_test_TU_SECRET_KEY_AQUI")) {
            Stripe.apiKey = secretKey;
            stripeInicializado = true;
            logger.info("Stripe inicializado correctamente");
        } else {
            logger.warn("Stripe no configurado - usa credenciales de prueba en application.properties");
        }
    }

    public Session crearSesionProductos(Cliente cliente, List<Map<String, Object>> items, BigDecimal total, Long ordenId) throws StripeException {
        if (!stripeInicializado) {
            throw new RuntimeException("Stripe no esta configurado. Configura stripe.secret-key en application.properties");
        }

        SessionCreateParams.LineItem[] lineItems = items.stream().map(item -> {
            String nombre = (String) item.get("nombre");
            BigDecimal precio = BigDecimal.valueOf(((Number) item.get("precio")).doubleValue());
            int cantidad = ((Number) item.get("cantidad")).intValue();

            return SessionCreateParams.LineItem.builder()
                    .setQuantity((long) cantidad)
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("pen")
                            .setUnitAmount(precio.multiply(BigDecimal.valueOf(100)).longValue())
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(nombre)
                                    .build())
                            .build())
                    .build();
        }).toArray(SessionCreateParams.LineItem[]::new);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/shop/confirmacion?status=success&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/shop/confirmacion?status=canceled")
                .setCustomerEmail(cliente.getCorreoElectronico())
                .setClientReferenceId(String.valueOf(ordenId))
                .addAllLineItem(List.of(lineItems))
                .build();

        Session session = Session.create(params);
        logger.info("Sesion Stripe creada: {} para orden {}", session.getId(), ordenId);
        return session;
    }

    public Session crearSesionCita(Cita cita) throws StripeException {
        if (!stripeInicializado) {
            throw new RuntimeException("Stripe no esta configurado. Configura stripe.secret-key en application.properties");
        }

        BigDecimal monto = cita.getMontoPagado() != null ? cita.getMontoPagado()
                : cita.getServicio().getPrecioMinimo();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/shop/confirmacion?status=success&type=cita&citaId=" + cita.getId() + "&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/shop/confirmacion?status=canceled&type=cita")
                .setCustomerEmail(cita.getCliente().getCorreoElectronico())
                .setClientReferenceId("cita_" + cita.getId())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("pen")
                                .setUnitAmount(monto.multiply(BigDecimal.valueOf(100)).longValue())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Cita: " + cita.getServicio().getNombre())
                                        .build())
                                .build())
                        .build())
                .build();

        Session session = Session.create(params);
        logger.info("Sesion Stripe creada: {} para cita {}", session.getId(), cita.getId());
        return session;
    }

    public void procesarPagoExitoso(String clientReferenceId, String paymentIntentId) {
        if (clientReferenceId == null) return;

        if (clientReferenceId.startsWith("cita_")) {
            Long citaId = Long.parseLong(clientReferenceId.replace("cita_", ""));
            citaRepository.findById(citaId).ifPresent(cita -> {
                List<Pago> pagos = pagoRepository.findByCitaId(citaId);
                Pago pago;
                if (pagos.isEmpty()) {
                    pago = Pago.builder()
                            .cita(cita)
                            .cliente(cita.getCliente())
                            .metodoPago("stripe")
                            .monto(cita.getMontoPagado() != null ? cita.getMontoPagado()
                                    : cita.getServicio().getPrecioMinimo())
                            .estado("completado")
                            .preferenceId(null)
                            .mercadoPagoPaymentId(null)
                            .build();
                } else {
                    pago = pagos.get(0);
                    pago.setEstado("completado");
                }
                pago.setIdTransaccionSimulada(paymentIntentId);
                pagoRepository.save(pago);
                logger.info("Pago Stripe registrado para cita {}: paymentIntent={}", citaId, paymentIntentId);
            });
        } else {
            Long ordenId = Long.parseLong(clientReferenceId);
            ordenRepository.findById(ordenId).ifPresent(orden -> {
                orden.setEstado("completada");
                orden.setIdTransaccionSimulada(paymentIntentId);
                ordenRepository.save(orden);
                logger.info("Pago Stripe registrado para orden {}: paymentIntent={}", ordenId, paymentIntentId);

                try {
                    notificacionService.enviarConfirmacionPedido(orden);
                } catch (Exception e) {
                    logger.error("Error al enviar notificacion de orden {}: {}", ordenId, e.getMessage());
                }
            });
        }
    }
}
