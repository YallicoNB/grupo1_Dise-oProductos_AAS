package com.antonela.art.repository;

import com.antonela.art.entity.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {

    List<OrdenCompra> findByClienteIdOrderByCreadoEnDesc(Long idCliente);

    List<OrdenCompra> findAllByOrderByCreadoEnDesc();
}
