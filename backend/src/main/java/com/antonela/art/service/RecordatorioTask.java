package com.antonela.art.service;

import com.antonela.art.entity.Cita;
import com.antonela.art.repository.CitaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class RecordatorioTask {

    private static final Logger logger = LoggerFactory.getLogger(RecordatorioTask.class);

    private final CitaRepository citaRepository;
    private final NotificacionService notificacionService;

    public RecordatorioTask(CitaRepository citaRepository,
            NotificacionService notificacionService) {
        this.citaRepository = citaRepository;
        this.notificacionService = notificacionService;
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void enviarRecordatoriosDiarios() {
        LocalDate manana = LocalDate.now().plusDays(1);
        logger.info("Enviando recordatorios para citas del día: {}", manana);

        List<Cita> citasManana = citaRepository.findByFechaCitaBetween(manana, manana);

        int enviados = 0;
        for (Cita cita : citasManana) {
            if (!"cancelada".equalsIgnoreCase(cita.getEstado())) {
                try {
                    notificacionService.enviarRecordatorioCita(cita);
                    enviados++;
                } catch (Exception e) {
                    logger.error("Error al enviar recordatorio para cita {}: {}", cita.getId(), e.getMessage());
                }
            }
        }

        logger.info("Recordatorios enviados: {} de {}", enviados, citasManana.size());
    }
}
