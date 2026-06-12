package com.antonela.art.service;

import com.antonela.art.dto.CrearCitaRequest;
import com.antonela.art.dto.FranjaHorariaDTO;
import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.Servicio;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.repository.ServicioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class    ReservaService {

    private static final Logger logger = LoggerFactory.getLogger(ReservaService.class);

    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final ServicioRepository servicioRepository;
    private final NotificacionService notificacionService;

    public ReservaService(CitaRepository citaRepository,
            ClienteRepository clienteRepository,
            ServicioRepository servicioRepository,
            NotificacionService notificacionService) {
        this.citaRepository = citaRepository;
        this.clienteRepository = clienteRepository;
        this.servicioRepository = servicioRepository;
        this.notificacionService = notificacionService;
    }

    public List<FranjaHorariaDTO> obtenerFranjasDisponibles(LocalDate fecha, Long idServicio) {
        logger.info("Obteniendo franjas disponibles para fecha: {} y servicio: {}", fecha, idServicio);

        if (fecha == null || idServicio == null) {
            throw new IllegalArgumentException("La fecha y el servicio son obligatorios");
        }

        if (!servicioRepository.existsById(idServicio)) {
            throw new RuntimeException("Servicio no encontrado");
        }

        List<FranjaHorariaDTO> franjas = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // Horarios de 9:00 a 18:00 (intervalos de 1 hora, el último slot inicia a las
        // 17:00)
        for (int horaInt = 9; horaInt <= 17; horaInt++) {
            LocalTime hora = LocalTime.of(horaInt, 0);
            boolean disponible = true;

            if (fecha.isBefore(LocalDate.now())) {
                disponible = false;
            } else if (fecha.isEqual(LocalDate.now()) && hora.isBefore(LocalTime.now())) {
                disponible = false;
            } else {
                disponible = estaFranjaDisponible(fecha, hora);
            }

            franjas.add(new FranjaHorariaDTO(hora.format(formatter), disponible));
        }

        return franjas;
    }

    public boolean estaFranjaDisponible(LocalDate fecha, LocalTime hora) {
        List<Cita> citas = citaRepository.findByFechaCitaAndHoraCita(fecha, hora);
        // Si hay una cita que no está cancelada, la franja no está disponible
        return citas.stream().noneMatch(c -> !"cancelada".equalsIgnoreCase(c.getEstado()));
    }

    @Transactional
    public Cita crearCita(Long idCliente, CrearCitaRequest request) {
        logger.info("Intentando crear cita para cliente: {} en fecha: {} hora: {}", idCliente, request.fecha(),
                request.hora());

        if (request.fecha() == null || request.hora() == null) {
            throw new IllegalArgumentException("La fecha y la hora son obligatorias");
        }

        if (request.fecha().isBefore(LocalDate.now())) {
            throw new RuntimeException("La fecha debe ser futura");
        }

        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Servicio servicio = servicioRepository.findById(request.idServicio())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (!estaFranjaDisponible(request.fecha(), request.hora())) {
            logger.warn("Conflicto: la franja horaria ya está ocupada: {} {}", request.fecha(), request.hora());
            throw new RuntimeException("La franja horaria no está disponible");
        }

        Cita cita = Cita.builder()
                .cliente(cliente)
                .servicio(servicio)
                .fechaCita(request.fecha())
                .horaCita(request.hora())
                .estado("pendiente")
                .build();

        Cita guardada = citaRepository.save(cita);
        logger.info("Cita creada exitosamente con ID: {}", guardada.getId());

        try {
            notificacionService.enviarConfirmacionCita(guardada);
        } catch (Exception e) {
            logger.error("Error al enviar notificación de confirmación: {}", e.getMessage());
        }

        return guardada;
    }
}
