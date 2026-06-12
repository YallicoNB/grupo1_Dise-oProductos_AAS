package com.antonela.art.service;

import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.OrdenCompra;
import com.antonela.art.repository.OrdenCompraRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class CheckoutService {

    private final OrdenCompraRepository ordenRepository;
    private final ObjectMapper objectMapper;

    public CheckoutService(OrdenCompraRepository ordenRepository, ObjectMapper objectMapper) {
        this.ordenRepository = ordenRepository;
        this.objectMapper = objectMapper;
    }

    public OrdenCompra procesarCheckout(Cliente cliente, List<Map<String, Object>> items, String metodoPago) throws JsonProcessingException {

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("El carrito no puede estar vacio.");
        }

        if (!"efectivo".equals(metodoPago) && !"simulado_credito".equals(metodoPago)) {
            throw new IllegalArgumentException("Metodo de pago no valido.");
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String randomSuffix = String.valueOf((int) (Math.random() * 1000));
        String idTransaccion = "ORD-" + timestamp + "-" + randomSuffix;

        BigDecimal montoTotal = BigDecimal.ZERO;
        for (Map<String, Object> item : items) {
            BigDecimal precio = BigDecimal.valueOf(((Number) item.get("precio")).doubleValue());
            int cantidad = ((Number) item.get("cantidad")).intValue();
            montoTotal = montoTotal.add(precio.multiply(BigDecimal.valueOf(cantidad)));
        }

        String productosJson = objectMapper.writeValueAsString(items);

        OrdenCompra nuevaOrden = OrdenCompra.builder()
                .cliente(cliente)
                .idTransaccionSimulada(idTransaccion)
                .productos(productosJson)
                .montoTotal(montoTotal)
                .metodoPago(metodoPago)
                .estado("completada")
                .build();

        ordenRepository.save(nuevaOrden);
        return nuevaOrden;
    }

    public String serializarProductos(List<Map<String, Object>> items) throws JsonProcessingException {
        return objectMapper.writeValueAsString(items);
    }
}