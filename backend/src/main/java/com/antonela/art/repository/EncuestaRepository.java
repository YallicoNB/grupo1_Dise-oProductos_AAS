package com.antonela.art.repository;

import com.antonela.art.entity.EncuestaSatisfaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EncuestaRepository extends JpaRepository<EncuestaSatisfaccion, Long> {
    Optional<EncuestaSatisfaccion> findByCitaId(Long citaId);
    List<EncuestaSatisfaccion> findByCitaClienteId(Long clienteId);
    boolean existsByCitaId(Long citaId);

    @Query("SELECT AVG(e.puntuacion) FROM EncuestaSatisfaccion e")
    Double promedioPuntuacion();

    @Query("SELECT COUNT(e) FROM EncuestaSatisfaccion e WHERE e.puntuacion >= 4")
    Long countSatisfactorias();

    @Query("SELECT COUNT(e) FROM EncuestaSatisfaccion e")
    Long countTotal();
}
