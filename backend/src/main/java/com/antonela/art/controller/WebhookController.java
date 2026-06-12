package com.antonela.art.controller;

import com.antonela.art.service.StripeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    private final StripeService stripeService;
    private final ObjectMapper objectMapper;

    public WebhookController(StripeService stripeService, ObjectMapper objectMapper) {
        this.stripeService = stripeService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/stripe")
    public ResponseEntity<?> recibirNotificacionStripe(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        logger.info("Notificacion Stripe recibida");

        try {
            String eventType;
            JsonNode dataObject;

            if (webhookSecret != null && !webhookSecret.isEmpty()
                    && !webhookSecret.equals("whsec_TU_WEBHOOK_SECRET")) {
                com.stripe.model.Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
                eventType = event.getType();
                dataObject = objectMapper.readTree(event.getData().getObject().toJson());
            } else {
                logger.warn("Webhook secret no configurado - procesando evento sin verificar");
                JsonNode root = objectMapper.readTree(payload);
                eventType = root.get("type").asText();
                dataObject = root.get("data").get("object");
            }

            if ("checkout.session.completed".equals(eventType)) {
                String clientReferenceId = dataObject.get("client_reference_id").asText(null);
                String paymentIntentId = dataObject.get("payment_intent").asText(null);
                if (clientReferenceId != null && paymentIntentId != null) {
                    stripeService.procesarPagoExitoso(clientReferenceId, paymentIntentId);
                }
            }

            return ResponseEntity.ok(Map.of("mensaje", "Notificacion recibida"));
        } catch (Exception e) {
            logger.error("Error procesando notificacion Stripe: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("mensaje", "Notificacion recibida con error"));
        }
    }

    @GetMapping("/stripe")
    public ResponseEntity<?> verificarWebhook() {
        return ResponseEntity.ok(Map.of("status", "activo"));
    }
}
