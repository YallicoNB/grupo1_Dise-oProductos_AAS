package com.antonela.art.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reembolsos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reembolso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false)
    private Cita cita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pago", nullable = false)
    private Pago pago;

    @Column(name = "monto_reembolsado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoReembolsado;

    @Column(name = "porcentaje_reembolso", nullable = false)
    private Integer porcentajeReembolso;

    @Column(nullable = false, length = 20)
    private String estado = "procesado";

    @Column(name = "id_transaccion_simulada", length = 255)
    private String idTransaccionSimulada;

    @Column(name = "mensaje_error", columnDefinition = "TEXT")
    private String mensajeError;

    @Column(name = "procesado_en")
    private LocalDateTime procesadoEn;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
