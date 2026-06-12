package com.antonela.art.repository;

import com.antonela.art.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByClienteIdOrderByFechaCitaAscHoraCitaAsc(Long idCliente);

    List<Cita> findByClienteIdAndEstadoOrderByFechaCitaAscHoraCitaAsc(Long idCliente, String estado);

    List<Cita> findByFechaCitaBetweenOrderByFechaCitaAscHoraCitaAsc(LocalDate startDate, LocalDate endDate);

    List<Cita> findByFechaCitaBetween(LocalDate startDate, LocalDate endDate);

    List<Cita> findByFechaCitaAndHoraCita(LocalDate fechaCita, LocalTime horaCita);

    Optional<Cita> findByFechaCitaAndHoraCitaAndIdNot(LocalDate fechaCita, LocalTime horaCita, Long id);
}
