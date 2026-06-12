package com.antonela.art.repository;

import com.antonela.art.entity.TokenRecuperacionContrasena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRecuperacionContrasenaRepository extends JpaRepository<TokenRecuperacionContrasena, Long> {

    Optional<TokenRecuperacionContrasena> findByToken(String token);

    Optional<TokenRecuperacionContrasena> findByClienteIdAndUsadoFalse(Long idCliente);
}
