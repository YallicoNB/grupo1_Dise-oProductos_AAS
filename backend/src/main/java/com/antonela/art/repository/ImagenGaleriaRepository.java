package com.antonela.art.repository;

import com.antonela.art.entity.ImagenGaleria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagenGaleriaRepository extends JpaRepository<ImagenGaleria, Long> {

    List<ImagenGaleria> findAllByOrderByCategoriaAsc();
}
