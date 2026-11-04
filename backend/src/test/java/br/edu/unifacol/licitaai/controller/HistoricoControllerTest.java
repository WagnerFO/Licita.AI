package br.edu.unifacol.licitaai.controller;

import br.edu.unifacol.licitaai.dto.HistoricoResponse;
import br.edu.unifacol.licitaai.entity.Auditoria;
import br.edu.unifacol.licitaai.service.AuditoriaService;
import br.edu.unifacol.licitaai.service.ContratoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoricoControllerTest {
    @Mock AuditoriaService auditoria;
    @Mock ContratoService contratos;
    @InjectMocks HistoricoController controller;

    @Test void consultaDeContratoInexistenteRetorna404() {
        when(contratos.buscar(404L)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
        ResponseStatusException erro = assertThrows(
                ResponseStatusException.class, () -> controller.historico(404L));
        assertEquals(HttpStatus.NOT_FOUND, erro.getStatusCode());
        verifyNoInteractions(auditoria);
    }

    @Test void consultaRetornaEventoComUsuarioEAlteracoes() {
        UUID evento = UUID.randomUUID();
        Auditoria registro = new Auditoria(evento, "CONTRATO", 1L, "ATUALIZACAO",
                "empresa", "Antiga", "Nova", "revisor@teste.local");
        when(auditoria.historico("CONTRATO", 1L)).thenReturn(List.of(registro));
        List<HistoricoResponse> resposta = controller.historico(1L);
        verify(contratos).buscar(1L);
        verify(auditoria).historico("CONTRATO", 1L);
        assertEquals(1, resposta.size());
        HistoricoResponse dado = resposta.get(0);
        assertEquals(evento, dado.eventoId());
        assertEquals("ATUALIZACAO", dado.acao());
        assertEquals("empresa", dado.campo());
        assertEquals("Antiga", dado.valorAnterior());
        assertEquals("Nova", dado.valorNovo());
        assertEquals("revisor@teste.local", dado.usuarioEmail());
        assertNotNull(dado.dataHora());
    }
}
