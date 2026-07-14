package com.antonela.art.service;

import com.antonela.art.entity.Cita;
import com.antonela.art.entity.Servicio;
import com.antonela.art.repository.CitaRepository;
import com.antonela.art.repository.ServicioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecomendacionService {

    private static final Logger logger = LoggerFactory.getLogger(RecomendacionService.class);

    private final CitaRepository citaRepository;
    private final ServicioRepository servicioRepository;

    // Mapa de servicios complementarios: si el cliente pidio X, sugerir Y
    private static final Map<String, List<String>> COMPLEMENTOS = new LinkedHashMap<>();
    static {
        COMPLEMENTOS.put("Uñas acrílicas", List.of("Esmaltado", "Rubber", "Pedicura"));
        COMPLEMENTOS.put("Esmaltado", List.of("Pedicura", "Rubber", "Uñas acrílicas"));
        COMPLEMENTOS.put("Rubber", List.of("Esmaltado", "Uñas acrílicas", "Pedicura"));
        COMPLEMENTOS.put("Pedicura", List.of("Esmaltado", "Rubber"));
        COMPLEMENTOS.put("Pestañas 1x1", List.of("Laminado"));
        COMPLEMENTOS.put("Laminado", List.of("Pestañas 1x1"));
        COMPLEMENTOS.put("Planchado", List.of("Alisado", "Mascarilla Capilar de Karite"));
        COMPLEMENTOS.put("Alisado", List.of("Planchado", "Serum Capilar Reparador"));
    }

    public RecomendacionService(CitaRepository citaRepository,
                                ServicioRepository servicioRepository) {
        this.citaRepository = citaRepository;
        this.servicioRepository = servicioRepository;
    }

    public List<Map<String, Object>> obtenerRecomendaciones(Long clienteId) {
        List<Cita> citas = citaRepository.findByClienteIdOrderByFechaCitaAscHoraCitaAsc(clienteId);
        List<Cita> completadas = citas.stream()
                .filter(c -> "completada".equalsIgnoreCase(c.getEstado()))
                .toList();

        if (completadas.isEmpty()) {
            return sugerirServiciosPopulares(Collections.emptySet());
        }

        // Servicios que el cliente ya ha probado
        Set<String> probados = completadas.stream()
                .map(c -> c.getServicio().getNombre())
                .collect(Collectors.toSet());

        // Servicio mas frecuente
        Map<String, Long> freq = completadas.stream()
                .collect(Collectors.groupingBy(c -> c.getServicio().getNombre(), Collectors.counting()));
        String favorito = freq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (favorito == null) {
            return sugerirServiciosPopulares(probados);
        }

        // Buscar complementos para el servicio favorito que el cliente aun no ha probado
        List<String> complementos = COMPLEMENTOS.getOrDefault(favorito, List.of());
        List<String> sugerencias = complementos.stream()
                .filter(s -> !probados.contains(s))
                .limit(3)
                .collect(Collectors.toList());

        // Si no hay suficientes complementos, llenar con populares no probados
        if (sugerencias.isEmpty()) {
            return sugerirServiciosPopulares(probados);
        }

        return convertirASuggestions(sugerencias);
    }

    private List<Map<String, Object>> sugerirServiciosPopulares(Set<String> probados) {
        List<Servicio> todos = servicioRepository.findAll();
        List<String> sugerencias = todos.stream()
                .map(Servicio::getNombre)
                .filter(s -> !probados.contains(s))
                .limit(3)
                .collect(Collectors.toList());
        return convertirASuggestions(sugerencias);
    }

    private List<Map<String, Object>> convertirASuggestions(List<String> nombres) {
        return nombres.stream().map(nombre -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("nombre", nombre);
            item.put("razon", generarRazon(nombre));
            return item;
        }).collect(Collectors.toList());
    }

    private String generarRazon(String nombre) {
        if (nombre.contains("Uñas") || nombre.contains("Esmaltado") || nombre.contains("Rubber") || nombre.contains("Pedicura")) {
            return "Completa tu look de manos y pies";
        }
        if (nombre.contains("Pestañas") || nombre.contains("Laminado")) {
            return "Realza tu mirada";
        }
        if (nombre.contains("Alisado") || nombre.contains("Planchado")) {
            return "Transforma tu cabello";
        }
        return "Nuestros clientes tambien eligieron este servicio";
    }
}
