package com.antonela.art.repository;

import com.antonela.art.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByClienteIdOrderByCreadoEnDesc(Long clienteId);
    List<Comentario> findAllByOrderByCreadoEnDesc();
    List<Comentario> findByEstadoOrderByCreadoEnDesc(String estado);
}
