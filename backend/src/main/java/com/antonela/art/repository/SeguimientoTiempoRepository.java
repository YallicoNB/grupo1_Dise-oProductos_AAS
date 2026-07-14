package com.antonela.art.repository;

import com.antonela.art.entity.SeguimientoTiempo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SeguimientoTiempoRepository extends JpaRepository<SeguimientoTiempo, Long> {
    Optional<SeguimientoTiempo> findByCitaId(Long citaId);
    boolean existsByCitaId(Long citaId);

    @Query("SELECT COUNT(s) FROM SeguimientoTiempo s WHERE s.completadoATiempo = true")
    Long countATiempo();

    @Query("SELECT COUNT(s) FROM SeguimientoTiempo s")
    Long countTotal();

    @Query("SELECT AVG(s.diferenciaMinutos) FROM SeguimientoTiempo s WHERE s.horaFin IS NOT NULL")
    Double promedioDuracion();
}
