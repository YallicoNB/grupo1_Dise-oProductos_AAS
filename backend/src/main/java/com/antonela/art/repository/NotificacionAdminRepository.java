package com.antonela.art.repository;

import com.antonela.art.entity.NotificacionAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionAdminRepository extends JpaRepository<NotificacionAdmin, Long> {

    List<NotificacionAdmin> findAllByOrderByCreadoEnDesc();
}
