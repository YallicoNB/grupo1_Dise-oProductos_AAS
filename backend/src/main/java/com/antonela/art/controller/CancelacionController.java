package com.antonela.art.controller;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Pago;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.PagoRepository;
import com.antonela.art.entity.Reembolso;
import com.antonela.art.service.CancelacionService;
import com.antonela.art.service.NotificacionService;
import com.antonela.art.service.ReembolsoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cancellation")
public class CancelacionController {

    private static final Logger logger = LoggerFactory.getLogger(CancelacionController.class);

    private final CancelacionService cancelacionService;
    private final ReembolsoService reembolsoService;
    private final NotificacionService notificacionService;
    private final CitaRepository citaRepository;
    private final PagoRepository pagoRepository;

    public CancelacionController(CancelacionService cancelacionService,
                                  ReembolsoService reembolsoService,
                                  NotificacionService notificacionService,
                                  CitaRepository citaRepository,
                                  PagoRepository pagoRepository) {
        this.cancelacionService = cancelacionService;
        this.reembolsoService = reembolsoService;
        this.notificacionService = notificacionService;
        this.citaRepository = citaRepository;
        this.pagoRepository = pagoRepository;
    }

    @PostMapping("/calculate-refund")
    public ResponseEntity<?> calculateRefund(@RequestBody Map<String, Long> request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCita = request.get("idCita");
            if (idCita == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El idCita es requerido"));
            }

            Long idCliente = (Long) authentication.getPrincipal();
            Cita cita = citaRepository.findById(idCita)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getCliente().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tienes permiso para ver esta cita"));
            }

            int porcentaje = cancelacionService.calcularPorcentajeReembolso(cita);
            BigDecimal montoOriginal = cita.getMontoPagado() != null ? cita.getMontoPagado()
                    : cita.getServicio().getPrecioMinimo();
            BigDecimal montoReembolso = cancelacionService.calcularMontoReembolso(cita);

            return ResponseEntity.ok(Map.of(
                    "porcentajeReembolso", porcentaje,
                    "montoReembolso", montoReembolso,
                    "montoOriginal", montoOriginal));
        } catch (Exception e) {
            logger.error("Error al calcular reembolso", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cancel-appointment")
    @Transactional
    public ResponseEntity<?> cancelAppointment(@RequestBody Map<String, Long> request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        }
        try {
            Long idCita = request.get("idCita");
            if (idCita == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El idCita es requerido"));
            }

            Long idCliente = (Long) authentication.getPrincipal();
            Cita cita = citaRepository.findById(idCita)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getCliente().getId().equals(idCliente)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tienes permiso para cancelar esta cita"));
            }

            if ("cancelada".equalsIgnoreCase(cita.getEstado())) {
                return ResponseEntity.badRequest().body(Map.of("error", "La cita ya se encuentra cancelada"));
            }

            int porcentaje = cancelacionService.calcularPorcentajeReembolso(cita);
            BigDecimal montoOriginal = cita.getMontoPagado() != null ? cita.getMontoPagado()
                    : cita.getServicio().getPrecioMinimo();
            BigDecimal montoReembolso = cancelacionService.calcularMontoReembolso(cita);

            cita.setEstado("cancelada");
            citaRepository.save(cita);

            List<Pago> pagos = pagoRepository.findByCitaId(idCita);
            Pago pago;
            if (pagos.isEmpty()) {
                String timestamp = String.valueOf(System.currentTimeMillis());
                pago = Pago.builder()
                        .cita(cita)
                        .cliente(cita.getCliente())
                        .metodoPago("simulado_credito")
                        .monto(montoOriginal)
                        .estado("completado")
                        .idTransaccionSimulada("SIM-PAG-" + timestamp)
                        .build();
                pago = pagoRepository.save(pago);
            } else {
                pago = pagos.get(0);
            }

            Reembolso reembolso = reembolsoService.procesarReembolso(pago, montoReembolso, porcentaje);

            try {
                notificacionService.enviarCancelacionConReembolso(cita, "Cancelado por el cliente", montoReembolso, porcentaje);
            } catch (Exception e) {
                logger.error("Error al enviar notificación de cancelación con reembolso: {}", e.getMessage());
            }

            logger.info("Cancelacion exitosa para la cita {}. Reembolso: {} ({}%) Transaccion: {}", idCita, montoReembolso, porcentaje, reembolso.getIdTransaccionSimulada());

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Cancelacion exitosa",
                    "montoReembolsado", montoReembolso,
                    "porcentajeReembolso", porcentaje,
                    "idTransaccion", reembolso.getIdTransaccionSimulada()));
        } catch (Exception e) {
            logger.error("Error al cancelar cita", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
