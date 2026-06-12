package com.antonela.art.controller;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.Pago;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.repository.PagoRepository;
import com.antonela.art.service.ServicioPago;
import com.antonela.art.service.StripeService;
import com.stripe.model.checkout.Session;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PagoController {

    private static final Logger logger = LoggerFactory.getLogger(PagoController.class);

    private final ServicioPago servicioPago;
    private final StripeService stripeService;
    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final PagoRepository pagoRepository;

    public PagoController(ServicioPago servicioPago,
                          StripeService stripeService,
                          CitaRepository citaRepository,
                          ClienteRepository clienteRepository,
                          PagoRepository pagoRepository) {
        this.servicioPago = servicioPago;
        this.stripeService = stripeService;
        this.citaRepository = citaRepository;
        this.clienteRepository = clienteRepository;
        this.pagoRepository = pagoRepository;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            Long idCita = Long.valueOf(request.get("idCita").toString());
            String metodoPago = (String) request.get("metodoPago");

            Cliente cliente = clienteRepository.findById(idCliente)
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

            Cita cita = citaRepository.findById(idCita)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getCliente().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tienes permiso para pagar esta cita"));
            }

            Pago pago = servicioPago.procesarPago(cita, cliente, metodoPago);
            logger.info("Pago procesado para cita {}: transaccion {}", idCita, pago.getIdTransaccionSimulada());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "idPago", pago.getId(),
                    "idTransaccion", pago.getIdTransaccionSimulada(),
                    "monto", pago.getMonto(),
                    "estado", pago.getEstado(),
                    "metodoPago", pago.getMetodoPago()));
        } catch (Exception e) {
            logger.error("Error al procesar pago", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            Long idCita = Long.valueOf(request.get("idCita").toString());

            Cita cita = citaRepository.findById(idCita)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getCliente().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tienes permiso para pagar esta cita"));
            }

            Session session = stripeService.crearSesionCita(cita);
            logger.info("Sesion Stripe creada para cita {}: {}", idCita, session.getId());

            return ResponseEntity.ok(Map.of(
                    "sessionId", session.getId(),
                    "url", session.getUrl()));

        } catch (Exception e) {
            logger.error("Error al crear sesion Stripe para cita", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirmar-pago")
    public ResponseEntity<?> confirmarPago(@RequestBody Map<String, Object> request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            String sessionId = (String) request.get("sessionId");
            Long idCita = Long.valueOf(request.get("idCita").toString());

            if (sessionId == null || sessionId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "sessionId es requerido"));
            }

            Cita cita = citaRepository.findById(idCita)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getCliente().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tienes permiso para esta cita"));
            }

            Session session = Session.retrieve(sessionId);
            String paymentIntentId = session.getPaymentIntent();

            if (paymentIntentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "La sesion no tiene payment intent"));
            }

            List<Pago> pagos = pagoRepository.findByCitaId(idCita);
            Pago pago;
            if (pagos.isEmpty()) {
                pago = Pago.builder()
                        .cita(cita)
                        .cliente(cita.getCliente())
                        .metodoPago("stripe")
                        .monto(cita.getMontoPagado() != null ? cita.getMontoPagado()
                                : cita.getServicio().getPrecioMinimo())
                        .estado("completado")
                        .idTransaccionSimulada(paymentIntentId)
                        .build();
            } else {
                pago = pagos.get(0);
                pago.setMetodoPago("stripe");
                pago.setEstado("completado");
                pago.setIdTransaccionSimulada(paymentIntentId);
            }
            pagoRepository.save(pago);

            logger.info("Pago confirmado para cita {}: paymentIntent={}", idCita, paymentIntentId);
            return ResponseEntity.ok(Map.of("ok", true, "paymentIntent", paymentIntentId));

        } catch (StripeException e) {
            logger.error("Error al recuperar sesion Stripe", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al conectar con Stripe: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al confirmar pago", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCliente = (Long) authentication.getPrincipal();
            List<Pago> pagos = pagoRepository.findByClienteIdOrderByCreadoEnDesc(idCliente);
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            logger.error("Error al obtener historial de pagos", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
