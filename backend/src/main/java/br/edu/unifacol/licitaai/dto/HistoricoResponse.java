package br.edu.unifacol.licitaai.dto;

import br.edu.unifacol.licitaai.entity.Auditoria;
import java.time.LocalDateTime;
import java.util.UUID;

public record HistoricoResponse(UUID eventoId, String acao, String campo,
                                String valorAnterior, String valorNovo,
                                String usuarioEmail, LocalDateTime dataHora) {
    public static HistoricoResponse de(Auditoria a) {
        return new HistoricoResponse(a.getEventoId(), a.getAcao(), a.getCampo(),
                a.getValorAnterior(), a.getValorNovo(), a.getUsuarioEmail(), a.getDataHora());
    }
}