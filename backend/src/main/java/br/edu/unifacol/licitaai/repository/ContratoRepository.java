package br.edu.unifacol.licitaai.repository;
import br.edu.unifacol.licitaai.entity.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface ContratoRepository extends JpaRepository<Contrato,Long>, JpaSpecificationExecutor<Contrato>{
    boolean existsByNumeroIgnoreCase(String numero);
    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, Long id);
}
