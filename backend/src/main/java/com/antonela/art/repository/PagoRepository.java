package com.antonela.art.repository;

import com.antonela.art.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByClienteIdOrderByCreadoEnDesc(Long idCliente);

    List<Pago> findByCitaId(Long idCita);
}
