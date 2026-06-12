package com.antonela.art;

import com.antonela.art.entity.*;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Combinators;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Proveedor central de generadores (Arbitraries) para property-based testing.
 * Cada metodo anotado con @Provide puede ser usado en tests via @ForAll("nombreProvider").
 */
public class ArbitrariesProvider {

    // ─── SERVICIOS ───────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Servicio> servicios() {
        return Arbitraries.of(
                new Servicio(null, "Planchado", "Alisado profesional", new BigDecimal("15.00"), new BigDecimal("20.00"), null, null),
                new Servicio(null, "Laminado", "Laminado de cejas", new BigDecimal("25.00"), null, null, null),
                new Servicio(null, "Pedicura", "Pedicura completa", new BigDecimal("26.00"), null, null, null),
                new Servicio(null, "Uñas acrílicas", "Uñas con diseño", new BigDecimal("50.00"), null, null, null),
                new Servicio(null, "Rubber", "Esmaltado en gel", new BigDecimal("35.00"), null, null, null),
                new Servicio(null, "Esmaltado", "Esmaltado semipermanente", new BigDecimal("25.00"), null, null, null),
                new Servicio(null, "Alisado", "Alisado progresivo", new BigDecimal("70.00"), null, null, null),
                new Servicio(null, "Pestañas 1x1", "Extensiones pelo a pelo", new BigDecimal("35.00"), null, null, null)
        );
    }

    // ─── PRODUCTOS ───────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Producto> productos() {
        return Arbitraries.of(
                new Producto(null, "Golden Elixir Face Oil", "Aceite facial de lujo", new BigDecimal("85.00"), "/img/img1.webp", true, null, null),
                new Producto(null, "Silk Recovery Serum", "Serum reparador", new BigDecimal("62.00"), "/img/img2.webp", true, null, null),
                new Producto(null, "Morning Ritual Set", "Set completo", new BigDecimal("145.00"), "/img/img3.webp", true, null, null),
                new Producto(null, "Rose Quartz Clay Mask", "Mascarilla purificante", new BigDecimal("48.00"), "/img/img4.webp", true, null, null),
                new Producto(null, "Botanical Mist", "Bruma hidratante", new BigDecimal("34.00"), "/img/img5.webp", true, null, null),
                new Producto(null, "Jade Sculpting Tool", "Gua Sha facial", new BigDecimal("25.00"), "/img/img6.webp", false, null, null),
                new Producto(null, "Luminous Vitamin C", "Serum iluminador", new BigDecimal("74.00"), "/img/img7.webp", true, null, null),
                new Producto(null, "Velvet Hand Therapy", "Crema de manos nutritiva", new BigDecimal("28.00"), "/img/img8.webp", true, null, null)
        );
    }

    // ─── CLIENTES ────────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Cliente> cliente() {
        return Arbitraries.of(
                new Cliente(null, "Ana García López", "ana.garcia@email.com", "999888777",
                        "$2a$10$hash1", 1, null, null),
                new Cliente(null, "María Rodríguez Paz", "maria.rodriguez@email.com", "987654321",
                        "$2a$10$hash2", 2, null, null),
                new Cliente(null, "Carla Mendoza Silva", "carla.mendoza@email.com", "976543210",
                        "$2a$10$hash3", 1, null, null),
                new Cliente(null, "Lucía Fernández Torres", "lucia.fernandez@email.com", "965432109",
                        "$2a$10$hash4", 1, null, null)
        );
    }

    // ─── TAREAS ──────────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Tarea> tareas() {
        return Arbitraries.of(
                new Tarea(null, "Revisar inventario de productos", false, null, null),
                new Tarea(null, "Actualizar precios de servicios", true, null, null),
                new Tarea(null, "Preparar reporte semanal", false, null, null),
                new Tarea(null, "Contactar proveedores", true, null, null),
                new Tarea(null, "Limpiar estación de trabajo", false, null, null)
        );
    }

    // ─── CITAS ───────────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Cita> cita() {
        Arbitrary<Servicio> serviciosGen = servicios();
        Arbitrary<Cliente> clientesGen = cliente();
        Arbitrary<LocalDate> fechas = Arbitraries.of(
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(14)
        );
        Arbitrary<LocalTime> horas = Arbitraries.of(
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                LocalTime.of(14, 0),
                LocalTime.of(15, 0),
                LocalTime.of(16, 0)
        );
        Arbitrary<String> estados = Arbitraries.of("pendiente", "completada", "cancelada");

        return Combinators.combine(serviciosGen, clientesGen, fechas, horas, estados)
                .as((servicio, cliente, fecha, hora, estado) -> {
                    Cita c = new Cita();
                    c.setServicio(servicio);
                    c.setCliente(cliente);
                    c.setFechaCita(fecha);
                    c.setHoraCita(hora);
                    c.setEstado(estado);
                    return c;
                });
    }

    // ─── PAGOS ───────────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Pago> pagos() {
        Arbitrary<Cita> citasGen = cita();
        Arbitrary<Cliente> clientesGen = cliente();
        Arbitrary<String> metodos = Arbitraries.of("efectivo", "simulado_credito");
        Arbitrary<BigDecimal> montos = Arbitraries.of(
                new BigDecimal("25.00"),
                new BigDecimal("35.00"),
                new BigDecimal("50.00"),
                new BigDecimal("85.00"),
                new BigDecimal("120.00")
        );

        return Combinators.combine(citasGen, clientesGen, metodos, montos)
                .as((cita, cliente, metodo, monto) -> {
                    Pago p = new Pago();
                    p.setCita(cita);
                    p.setCliente(cliente);
                    p.setMetodoPago(metodo);
                    p.setMonto(monto);
                    p.setEstado("completado");
                    return p;
                });
    }

    // ─── REEMBOLSOS ──────────────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<Reembolso> reembolsos() {
        Arbitrary<Pago> pagosGen = pagos();
        Arbitrary<Cita> citasGen = cita();
        Arbitrary<BigDecimal> montos = Arbitraries.of(
                new BigDecimal("25.00"),
                new BigDecimal("35.00"),
                new BigDecimal("50.00")
        );
        Arbitrary<Integer> porcentajes = Arbitraries.of(0, 50, 100);
        Arbitrary<String> estados = Arbitraries.of("procesado", "fallido");

        return Combinators.combine(pagosGen, citasGen, montos, porcentajes, estados)
                .as((pago, cita, monto, porcentaje, estado) -> {
                    Reembolso r = new Reembolso();
                    r.setPago(pago);
                    r.setCita(cita);
                    r.setMontoReembolsado(monto);
                    r.setPorcentajeReembolso(porcentaje);
                    r.setEstado(estado);
                    return r;
                });
    }

    // ─── TOKEN RECUPERACION ──────────────────────────────────────

    @net.jqwik.api.Provide
    Arbitrary<TokenRecuperacionContrasena> tokenRecuperacion() {
        Arbitrary<Cliente> clientesGen = cliente();
        return clientesGen.map(cliente -> {
            TokenRecuperacionContrasena t = new TokenRecuperacionContrasena();
            t.setCliente(cliente);
            t.setToken(java.util.UUID.randomUUID().toString());
            t.setUsado(false);
            t.setExpiraEn(java.time.LocalDateTime.now().plusHours(1));
            return t;
        });
    }
}
