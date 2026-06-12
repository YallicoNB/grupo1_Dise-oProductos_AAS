package com.antonela.art.repository;

import com.antonela.art.entity.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByCompletadaOrderByCreadoEnDesc(Boolean completada);
}
