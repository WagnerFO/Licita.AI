package br.edu.unifacol.licitaai.repository;

import br.edu.unifacol.licitaai.entity.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByEntidadeAndEntidadeIdOrderByDataHoraDescIdAsc(String entidade, Long entidadeId);
}