package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.entity.Contrato;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ContratoSnapshotTest {
    @Test void capturaCamposEFormataValores() {
        Contrato c = new Contrato();
        c.setNumero("003/2026");
        c.setProcessoLicitatorio("010/2026");
        c.setNumeroModalidade("009/2026");
        c.setModalidade("Pregão Eletrônico");
        c.setEmpresa("Empresa Exemplo");
        c.setCnpj("08.632.326/0001-43");
        c.setResumoObjeto("Transporte");
        c.setObjeto("Serviço de transporte escolar.");
        c.setValorEstimado(null);
        c.setValorTotal(new BigDecimal("123.4"));
        c.setOrgaoGestor("Educação");
        c.setSecretario(null);
        c.setDataAssinatura(LocalDate.of(2026, 1, 10));
        c.setDataFim(LocalDate.of(2027, 1, 10));
        c.setPrazoVigenciaMeses(12);
        Map<String,String> s = ContratoSnapshot.de(c);
        assertEquals(15, s.size());
        assertEquals("003/2026", s.get("numero"));
        assertEquals("010/2026", s.get("processoLicitatorio"));
        assertEquals("009/2026", s.get("numeroModalidade"));
        assertEquals("Pregão Eletrônico", s.get("modalidade"));
        assertEquals("Empresa Exemplo", s.get("empresa"));
        assertEquals("08.632.326/0001-43", s.get("cnpj"));
        assertEquals("Transporte", s.get("resumoObjeto"));
        assertEquals("Serviço de transporte escolar.", s.get("objeto"));
        assertNull(s.get("valorEstimado"));
        assertEquals("123.40", s.get("valorTotal"));
        assertEquals("Educação", s.get("orgaoGestor"));
        assertNull(s.get("secretario"));
        assertEquals("2026-01-10", s.get("dataAssinatura"));
        assertEquals("2027-01-10", s.get("dataFim"));
        assertEquals("12", s.get("prazoVigenciaMeses"));
    }
    @Test void valoresMonetariosEquivalentesNaoGeramDiferenca() {
        Contrato c = new Contrato();
        c.setValorTotal(new BigDecimal("100.0"));
        String anterior = ContratoSnapshot.de(c).get("valorTotal");
        c.setValorTotal(new BigDecimal("100.00"));
        assertEquals(anterior, ContratoSnapshot.de(c).get("valorTotal"));
    }
}
