package com.sistemapedidos.domain.repository;

import com.sistemapedidos.domain.entity.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdministradorRepository extends JpaRepository<Administrador, String> {

    Optional<Administrador> findByEmail(String email);

    List<Administrador> findAllByOrderByCreadoEnAsc();
}
