package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.dto.ContratoRequest;
import br.edu.unifacol.licitaai.entity.Auditoria;
import br.edu.unifacol.licitaai.entity.Contrato;
import br.edu.unifacol.licitaai.repository.AuditoriaRepository;
import br.edu.unifacol.licitaai.repository.ContratoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
class ContratoAuditoriaTransacaoIntegrationTest {
    @Autowired ContratoService service;
    @Autowired ContratoRepository contratos;
    @MockitoBean AuditoriaRepository auditorias;

    private ContratoRequest requisicao(String numero, String empresa) {
        return new ContratoRequest(numero, "001/2026", "002/2026", "Pregão Eletrônico",
                empresa, "08.632.326/0001-43", "Serviços", "Prestação de serviços.",
                new BigDecimal("500.00"), new BigDecimal("450.00"), "Secretaria de Educação",
                "Responsável", LocalDate.of(2026,1,1), LocalDate.of(2030,1,1), 48);
    }
    private String numeroUnico() {
        return "AUD-" + UUID.randomUUID().toString().substring(0,12);
    }

    @Test void falhaNaAuditoriaDesfazCriacaoDoContrato() {
        String numero = numeroUnico();
        when(auditorias.save(any(Auditoria.class)))
                .thenThrow(new DataIntegrityViolationException("Falha simulada na auditoria"));
        assertThrows(DataIntegrityViolationException.class,
                () -> service.criar(requisicao(numero, "Empresa Inicial")));
        assertFalse(contratos.existsByNumeroIgnoreCase(numero),
                "Contrato não deve persistir se auditoria falhar");
    }

    @Test void falhaNaAuditoriaDesfazAtualizacaoDoContrato() {
        String numero = numeroUnico();
        Long id = service.criar(requisicao(numero, "Empresa Inicial")).id();
        try {
            when(auditorias.save(any(Auditoria.class)))
                    .thenThrow(new DataIntegrityViolationException("Falha simulada na auditoria"));
            assertThrows(DataIntegrityViolationException.class,
                    () -> service.atualizar(id, requisicao(numero, "Empresa Nova")));
            Contrato persistido = contratos.findById(id).orElseThrow();
            assertEquals("Empresa Inicial", persistido.getEmpresa(),
                    "Mudança no contrato deve ser revertida se auditoria falhar");
        } finally {
            contratos.deleteById(id);
        }
    }
}
