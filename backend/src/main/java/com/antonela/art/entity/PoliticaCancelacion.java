package com.antonela.art.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "politica_cancelacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PoliticaCancelacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "horas_anticipacion_minimas", nullable = false)
    private Integer horasAnticipacionMinimas;

    @Column(name = "porcentaje_reembolso", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeReembolso;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
