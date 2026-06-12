package com.antonela.art.service;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.NotificacionAdmin;
import com.antonela.art.entity.OrdenCompra;
import com.antonela.art.repository.NotificacionAdminRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
public class NotificacionService {

    private static final Logger logger = LoggerFactory.getLogger(NotificacionService.class);

    @Value("${twilio.account-sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token}")
    private String twilioAuthToken;

    @Value("${twilio.whatsapp-number}")
    private String twilioWhatsappNumber;

    private final JavaMailSender mailSender;
    private final NotificacionAdminRepository notificacionAdminRepository;

    private boolean twilioInicializado = false;

    public NotificacionService(JavaMailSender mailSender,
            NotificacionAdminRepository notificacionAdminRepository) {
        this.mailSender = mailSender;
        this.notificacionAdminRepository = notificacionAdminRepository;
    }

    @PostConstruct
    public void initTwilio() {
        if (twilioAccountSid != null && !twilioAccountSid.equals("TU_ACCOUNT_SID")
                && twilioAuthToken != null && !twilioAuthToken.equals("TU_AUTH_TOKEN")) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            twilioInicializado = true;
            logger.info("Twilio inicializado correctamente");
        } else {
            logger.warn("Twilio no configurado - solo se usará correo electrónico");
        }
    }

    public void enviarConfirmacionCita(Cita cita) {
        String asunto = "Confirmación de cita - Antonela Art Salon";
        String cuerpo = generarMensajeConfirmacion(cita);

        boolean enviado = enviarWhatsApp(cita.getCliente().getTelefono(), cuerpo);
        if (!enviado) {
            enviarEmail(cita.getCliente().getCorreoElectronico(), asunto, cuerpo);
        }

        registrarNotificacionAdmin("cita_confirmada",
                "Cita confirmada: " + cita.getCliente().getNombreCompleto()
                        + " - " + cita.getFechaCita() + " " + cita.getHoraCita());
    }

    public void enviarRecordatorioCita(Cita cita) {
        String asunto = "Recordatorio de cita - Antonela Art Salon";
        String cuerpo = generarMensajeRecordatorio(cita);

        boolean enviado = enviarWhatsApp(cita.getCliente().getTelefono(), cuerpo);
        if (!enviado) {
            enviarEmail(cita.getCliente().getCorreoElectronico(), asunto, cuerpo);
        }

        logger.info("Recordatorio enviado para cita ID: {}", cita.getId());
    }

    public void enviarCancelacionCita(Cita cita, String motivo) {
        String asunto = "Cancelación de cita - Antonela Art Salon";
        String cuerpo = generarMensajeCancelacion(cita, motivo);

        boolean enviado = enviarWhatsApp(cita.getCliente().getTelefono(), cuerpo);
        if (!enviado) {
            enviarEmail(cita.getCliente().getCorreoElectronico(), asunto, cuerpo);
        }

        registrarNotificacionAdmin("cita_cancelada",
                "Cita cancelada: " + cita.getCliente().getNombreCompleto()
                        + " - " + cita.getFechaCita() + " " + cita.getHoraCita()
                        + " - Motivo: " + motivo);
    }

    public void enviarCancelacionConReembolso(Cita cita, String motivo, BigDecimal montoReembolso, int porcentaje) {
        String asunto = "Cancelación y reembolso - Antonela Art Salon";
        String cuerpo = generarMensajeCancelacionConReembolso(cita, motivo, montoReembolso, porcentaje);

        boolean enviado = enviarWhatsApp(cita.getCliente().getTelefono(), cuerpo);
        if (!enviado) {
            enviarEmail(cita.getCliente().getCorreoElectronico(), asunto, cuerpo);
        }

        registrarNotificacionAdmin("reembolso_cliente",
                "Cancelacion con reembolso: " + cita.getCliente().getNombreCompleto()
                        + " - S/ " + montoReembolso + " (" + porcentaje + "%)"
                        + " - Cita #" + cita.getId());
    }

    public void enviarReagendamientoCita(Cita cita, LocalDate fechaAnterior, LocalTime horaAnterior) {
        String asunto = "Cita reagendada - Antonela Art Salon";
        String cuerpo = generarMensajeReagendamiento(cita, fechaAnterior, horaAnterior);

        boolean enviado = enviarWhatsApp(cita.getCliente().getTelefono(), cuerpo);
        if (!enviado) {
            enviarEmail(cita.getCliente().getCorreoElectronico(), asunto, cuerpo);
        }

        registrarNotificacionAdmin("cita_reagendada",
                "Cita reagendada: " + cita.getCliente().getNombreCompleto()
                        + " - de " + fechaAnterior + " " + horaAnterior
                        + " a " + cita.getFechaCita() + " " + cita.getHoraCita());
    }

    public void enviarConfirmacionPedido(OrdenCompra orden) {
        String asunto = "Compra confirmada - Antonela Art Salon";
        String cuerpo = generarMensajeConfirmacionPedido(orden);

        String telefono = orden.getCliente().getTelefono();
        boolean enviado = enviarWhatsApp(telefono, cuerpo);
        if (!enviado) {
            enviarEmail(orden.getCliente().getCorreoElectronico(), asunto, cuerpo);
        }

        registrarNotificacionAdmin("pedido_confirmado",
                "Pedido #" + orden.getId() + " confirmado - "
                        + orden.getCliente().getNombreCompleto()
                        + " - S/ " + orden.getMontoTotal());
    }

    private boolean enviarWhatsApp(String destinatario, String mensaje) {
        if (!twilioInicializado) {
            logger.warn("Twilio no disponible, se omite WhatsApp");
            return false;
        }

        try {
            String numeroDestino = "whatsapp:+51" + destinatario.replaceAll("[^0-9]", "");
            if (destinatario.startsWith("+")) {
                numeroDestino = "whatsapp:" + destinatario;
            }

            Message message = Message.creator(
                    new PhoneNumber(numeroDestino),
                    new PhoneNumber(twilioWhatsappNumber),
                    mensaje).create();

            logger.info("WhatsApp enviado a {} - SID: {}", numeroDestino, message.getSid());
            return true;
        } catch (Exception e) {
            logger.error("Error al enviar WhatsApp a {}: {}", destinatario, e.getMessage());
            return false;
        }
    }

    private void enviarEmail(String destinatario, String asunto, String cuerpo) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            logger.info("Correo enviado a {} - Asunto: {}", destinatario, asunto);
        } catch (Exception e) {
            logger.error("Error al enviar correo a {}: {}", destinatario, e.getMessage());
        }
    }

    private void registrarNotificacionAdmin(String tipo, String mensaje) {
        try {
            NotificacionAdmin notificacion = NotificacionAdmin.builder()
                    .tipo(tipo)
                    .mensaje(mensaje)
                    .leida(false)
                    .build();
            notificacionAdminRepository.save(notificacion);
        } catch (Exception e) {
            logger.error("Error al registrar notificación admin: {}", e.getMessage());
        }
    }

    private String generarMensajeConfirmacionPedido(OrdenCompra orden) {
        return "Antonela Art Salon\n"
                + "=====================\n"
                + "Gracias por tu compra!\n\n"
                + "Pedido #" + orden.getId() + "\n"
                + "Total: S/ " + orden.getMontoTotal() + "\n\n"
                + "Tu pago ha sido procesado correctamente.\n"
                + "Te contactaremos cuando tu pedido esté listo para entrega.\n"
                + "Contacto: +51 999 999 999";
    }

    private String generarMensajeConfirmacion(Cita cita) {
        DateTimeFormatter fechaFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter horaFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return "🖌 Antonela Art Salon\n"
                + "=========================\n"
                + "¡Tu cita ha sido confirmada!\n\n"
                + "Cliente: " + cita.getCliente().getNombreCompleto() + "\n"
                + "Servicio: " + cita.getServicio().getNombre() + "\n"
                + "Fecha: " + cita.getFechaCita().format(fechaFormatter) + "\n"
                + "Hora: " + cita.getHoraCita().format(horaFormatter) + "\n\n"
                + "Te esperamos en nuestro local.\n"
                + "Si necesitas cancelar o reagendar, contáctanos con al menos 24h de anticipación.\n"
                + "📞 +51 999 999 999";
    }

    private String generarMensajeRecordatorio(Cita cita) {
        DateTimeFormatter fechaFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter horaFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return "🖌 Antonela Art Salon\n"
                + "=========================\n"
                + "Recordatorio de tu cita mañana:\n\n"
                + "Cliente: " + cita.getCliente().getNombreCompleto() + "\n"
                + "Servicio: " + cita.getServicio().getNombre() + "\n"
                + "Fecha: " + cita.getFechaCita().format(fechaFormatter) + "\n"
                + "Hora: " + cita.getHoraCita().format(horaFormatter) + "\n\n"
                + "¡Te esperamos! 🎨";
    }

    private String generarMensajeCancelacion(Cita cita, String motivo) {
        DateTimeFormatter fechaFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter horaFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return "🖌 Antonela Art Salon\n"
                + "=========================\n"
                + "Tu cita ha sido cancelada.\n\n"
                + "Cliente: " + cita.getCliente().getNombreCompleto() + "\n"
                + "Servicio: " + cita.getServicio().getNombre() + "\n"
                + "Fecha: " + cita.getFechaCita().format(fechaFormatter) + "\n"
                + "Hora: " + cita.getHoraCita().format(horaFormatter) + "\n"
                + "Motivo: " + motivo + "\n\n"
                + "Si deseas agendar una nueva cita, contáctanos.\n"
                + "📞 +51 999 999 999";
    }

    private String generarMensajeCancelacionConReembolso(Cita cita, String motivo, BigDecimal monto, int porcentaje) {
        DateTimeFormatter fechaFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter horaFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return "Antonela Art Salon\n"
                + "=========================\n"
                + "Tu cita ha sido cancelada.\n\n"
                + "Cliente: " + cita.getCliente().getNombreCompleto() + "\n"
                + "Servicio: " + cita.getServicio().getNombre() + "\n"
                + "Fecha: " + cita.getFechaCita().format(fechaFormatter) + "\n"
                + "Hora: " + cita.getHoraCita().format(horaFormatter) + "\n"
                + "Motivo: " + motivo + "\n\n"
                + "--- REEMBOLSO ---\n"
                + "Monto original: S/ " + (cita.getMontoPagado() != null
                        ? cita.getMontoPagado() : cita.getServicio().getPrecioMinimo()) + "\n"
                + "Porcentaje de reembolso: " + porcentaje + "%\n"
                + "Monto a reembolsar: S/ " + monto + "\n"
                + (porcentaje > 0
                        ? "El reembolso se procesara en los proximos dias habiles.\n"
                        : "No aplica reembolso segun nuestra politica de cancelacion.\n")
                + "\nSi deseas agendar una nueva cita, visita nuestra web.\n"
                + "Contacto: +51 999 999 999";
    }

    private String generarMensajeReagendamiento(Cita cita, LocalDate fechaAnterior, LocalTime horaAnterior) {
        DateTimeFormatter fechaFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter horaFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return "🖌 Antonela Art Salon\n"
                + "=========================\n"
                + "Tu cita ha sido reagendada.\n\n"
                + "Anterior: " + fechaAnterior.format(fechaFormatter) + " " + horaAnterior.format(horaFormatter) + "\n"
                + "Nueva fecha: " + cita.getFechaCita().format(fechaFormatter) + "\n"
                + "Nueva hora: " + cita.getHoraCita().format(horaFormatter) + "\n\n"
                + "Servicio: " + cita.getServicio().getNombre() + "\n"
                + "¡Te esperamos! 🎨";
    }
}
