package com.antonela.art.controller;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.OrdenCompra;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ClienteRepository;
import com.antonela.art.repository.OrdenCompraRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clients")
public class AdminClienteController {

    private static final Logger logger = LoggerFactory.getLogger(AdminClienteController.class);

    private final ClienteRepository clienteRepository;
    private final CitaRepository citaRepository;
    private final OrdenCompraRepository ordenCompraRepository;

    public AdminClienteController(ClienteRepository clienteRepository,
                                  CitaRepository citaRepository,
                                  OrdenCompraRepository ordenCompraRepository) {
        this.clienteRepository = clienteRepository;
        this.citaRepository = citaRepository;
        this.ordenCompraRepository = ordenCompraRepository;
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> getAll() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<Cita>> getAppointments(@PathVariable Long id) {
        List<Cita> citas = citaRepository.findByClienteIdOrderByFechaCitaAscHoraCitaAsc(id);
        return ResponseEntity.ok(citas);
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<OrdenCompra>> getOrders(@PathVariable Long id) {
        List<OrdenCompra> ordenes = ordenCompraRepository.findByClienteIdOrderByCreadoEnDesc(id);
        return ResponseEntity.ok(ordenes);
    }
}
