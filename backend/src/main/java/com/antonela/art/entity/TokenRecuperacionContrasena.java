package com.antonela.art.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_recuperacion_contrasena")
public class TokenRecuperacionContrasena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 255, unique = true)
    private String token;

    @Column(nullable = false)
    private Boolean usado = false;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    public TokenRecuperacionContrasena() {}

    public TokenRecuperacionContrasena(Long id, Cliente cliente, String token, Boolean usado,
                                       LocalDateTime expiraEn, LocalDateTime creadoEn) {
        this.id = id;
        this.cliente = cliente;
        this.token = token;
        this.usado = usado;
        this.expiraEn = expiraEn;
        this.creadoEn = creadoEn;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Boolean getUsado() { return usado; }
    public void setUsado(Boolean usado) { this.usado = usado; }
    public LocalDateTime getExpiraEn() { return expiraEn; }
    public void setExpiraEn(LocalDateTime expiraEn) { this.expiraEn = expiraEn; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(expiraEn);
    }

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
