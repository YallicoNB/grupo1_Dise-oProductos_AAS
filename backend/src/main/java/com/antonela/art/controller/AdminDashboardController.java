package com.antonela.art.controller;

import com.antonela.art.entity.NotificacionAdmin;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.repository.EncuestaRepository;
import com.antonela.art.repository.NotificacionAdminRepository;
import com.antonela.art.repository.OrdenCompraRepository;
import com.antonela.art.repository.ProductoRepository;
import com.antonela.art.repository.SeguimientoTiempoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardController.class);

    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final OrdenCompraRepository ordenCompraRepository;
    private final ProductoRepository productoRepository;
    private final NotificacionAdminRepository notificacionAdminRepository;
    private final EncuestaRepository encuestaRepository;
    private final SeguimientoTiempoRepository seguimientoTiempoRepository;

    public AdminDashboardController(CitaRepository citaRepository,
                                    ClienteRepository clienteRepository,
                                    OrdenCompraRepository ordenCompraRepository,
                                    ProductoRepository productoRepository,
                                    NotificacionAdminRepository notificacionAdminRepository,
                                    EncuestaRepository encuestaRepository,
                                    SeguimientoTiempoRepository seguimientoTiempoRepository) {
        this.citaRepository = citaRepository;
        this.clienteRepository = clienteRepository;
        this.ordenCompraRepository = ordenCompraRepository;
        this.productoRepository = productoRepository;
        this.notificacionAdminRepository = notificacionAdminRepository;
        this.encuestaRepository = encuestaRepository;
        this.seguimientoTiempoRepository = seguimientoTiempoRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);

        long citasHoy = citaRepository.findByFechaCitaBetweenOrderByFechaCitaAscHoraCitaAsc(hoy, hoy).size();
        long totalClientes = clienteRepository.count();
        long productosActivos = productoRepository.findByDisponibleTrue().size();
        long totalOrdenes = ordenCompraRepository.count();

        Double promedioSat = encuestaRepository.promedioPuntuacion();
        Long totalEncuestas = encuestaRepository.countTotal();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("citasHoy", citasHoy);
        stats.put("totalClientes", totalClientes);
        stats.put("productosActivos", productosActivos);
        stats.put("totalOrdenes", totalOrdenes);
        stats.put("satisfaccionPromedio", promedioSat != null ? Math.round(promedioSat * 100.0) / 100.0 : 0);
        stats.put("totalEncuestas", totalEncuestas != null ? totalEncuestas : 0);

        Long serviciosATiempo = seguimientoTiempoRepository.countATiempo();
        Long totalServicios = seguimientoTiempoRepository.countTotal();
        Double promedioDuracion = seguimientoTiempoRepository.promedioDuracion();
        stats.put("serviciosATiempo", serviciosATiempo != null ? serviciosATiempo : 0);
        stats.put("totalServiciosTimed", totalServicios != null ? totalServicios : 0);
        stats.put("promedioDuracionMinutos", promedioDuracion != null ? Math.round(promedioDuracion * 10.0) / 10.0 : 0);

        logger.info("Dashboard consultado: citasHoy={}, clientes={}", citasHoy, totalClientes);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/notifications")
    public ResponseEntity<java.util.List<NotificacionAdmin>> getNotifications() {
        return ResponseEntity.ok(notificacionAdminRepository.findAllByOrderByCreadoEnDesc());
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificacionAdminRepository.findById(id).ifPresent(n -> {
            n.setLeida(true);
            notificacionAdminRepository.save(n);
        });
        return ResponseEntity.ok(Map.of("mensaje", "ok"));
    }
}
