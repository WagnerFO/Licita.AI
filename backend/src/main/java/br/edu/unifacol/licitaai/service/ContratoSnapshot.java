package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.entity.Contrato;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ContratoSnapshot {
    private ContratoSnapshot() {}

    public static Map<String, String> de(Contrato c) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("numero", c.getNumero());
        m.put("processoLicitatorio", c.getProcessoLicitatorio());
        m.put("numeroModalidade", c.getNumeroModalidade());
        m.put("modalidade", c.getModalidade());
        m.put("empresa", c.getEmpresa());
        m.put("cnpj", c.getCnpj());
        m.put("resumoObjeto", c.getResumoObjeto());
        m.put("objeto", c.getObjeto());
        m.put("valorEstimado", dinheiro(c.getValorEstimado()));
        m.put("valorTotal", dinheiro(c.getValorTotal()));
        m.put("orgaoGestor", c.getOrgaoGestor());
        m.put("secretario", c.getSecretario());
        m.put("dataAssinatura", texto(c.getDataAssinatura()));
        m.put("dataFim", texto(c.getDataFim()));
        m.put("prazoVigenciaMeses", texto(c.getPrazoVigenciaMeses()));
        return m;
    }

    private static String dinheiro(BigDecimal v) {
        return v == null ? null : v.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String texto(Object o) {
        return o == null ? null : o.toString();
    }
}