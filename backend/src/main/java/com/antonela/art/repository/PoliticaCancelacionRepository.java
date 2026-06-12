package com.antonela.art.repository;

import com.antonela.art.entity.PoliticaCancelacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoliticaCancelacionRepository extends JpaRepository<PoliticaCancelacion, Long> {

    List<PoliticaCancelacion> findAllByOrderByHorasAnticipacionMinimasDesc();
}
