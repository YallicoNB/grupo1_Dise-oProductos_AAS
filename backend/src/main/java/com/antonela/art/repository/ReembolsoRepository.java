package com.antonela.art.repository;

import com.antonela.art.entity.Reembolso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import  java.util.Optional;
import java.util.List;

@Repository
public interface ReembolsoRepository extends JpaRepository<Reembolso, Long> {

    Optional<Reembolso> findByCitaIdAndEstado(Long idCita, String estado);

    List<Reembolso> findByCitaId(Long idCita);
}
