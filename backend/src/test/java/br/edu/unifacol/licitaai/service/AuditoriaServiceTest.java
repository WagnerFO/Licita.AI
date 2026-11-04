package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.entity.Auditoria;
import br.edu.unifacol.licitaai.repository.AuditoriaRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditoriaServiceTest {
    @Mock AuditoriaRepository repository;
    @InjectMocks AuditoriaService service;

    @BeforeEach void autenticar() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("revisor@teste.local", null, List.of()));
    }
    @AfterEach void limparSeguranca() { SecurityContextHolder.clearContext(); }

    @Test void criacaoRegistraUsuarioEData() {
        var inicio = LocalDateTime.now();
        service.registrarCriacao("CONTRATO", 7L);
        var fim = LocalDateTime.now();
        ArgumentCaptor<Auditoria> cap = ArgumentCaptor.forClass(Auditoria.class);
        verify(repository).save(cap.capture());
        var evento = cap.getValue();
        assertNotNull(evento.getEventoId());
        assertEquals("CONTRATO", evento.getEntidade());
        assertEquals(7L, evento.getEntidadeId());
        assertEquals("CRIACAO", evento.getAcao());
        assertNull(evento.getCampo());
        assertNull(evento.getValorAnterior());
        assertNull(evento.getValorNovo());
        assertEquals("revisor@teste.local", evento.getUsuarioEmail());
        assertFalse(evento.getDataHora().isBefore(inicio));
        assertFalse(evento.getDataHora().isAfter(fim));
    }

    @Test void atualizacaoRegistraSoCamposAlteradosComMesmoEvento() {
        Map<String,String> antes = new LinkedHashMap<>();
        antes.put("numero", "01/2026");
        antes.put("empresa", "Empresa A");
        antes.put("secretario", null);
        Map<String,String> depois = new LinkedHashMap<>();
        depois.put("numero", "01/2026");
        depois.put("empresa", "Empresa B");
        depois.put("secretario", "Ana");

        service.registrarAtualizacao("CONTRATO", 9L, antes, depois);
        ArgumentCaptor<Auditoria> cap = ArgumentCaptor.forClass(Auditoria.class);
        verify(repository, times(2)).save(cap.capture());
        var eventos = cap.getAllValues();
        assertEquals(List.of("empresa", "secretario"),
                eventos.stream().map(Auditoria::getCampo).toList());
        assertEquals(eventos.get(0).getEventoId(), eventos.get(1).getEventoId());
        assertNotNull(eventos.get(0).getEventoId());
        assertEquals("Empresa A", eventos.get(0).getValorAnterior());
        assertEquals("Empresa B", eventos.get(0).getValorNovo());
        assertNull(eventos.get(1).getValorAnterior());
        assertEquals("Ana", eventos.get(1).getValorNovo());
        for(var evento : eventos) {
            assertEquals("ATUALIZACAO", evento.getAcao());
            assertEquals("revisor@teste.local", evento.getUsuarioEmail());
            assertEquals(9L, evento.getEntidadeId());
            assertNotNull(evento.getDataHora());
        }
    }

    @Test void atualizacaoSemMudancasNaoPersisteEvento() {
        Map<String,String> dados = Map.of("numero", "01/2026", "empresa", "Empresa A");
        service.registrarAtualizacao("CONTRATO", 9L, dados, new LinkedHashMap<>(dados));
        verifyNoInteractions(repository);
    }

    @Test void historicoFiltraPorEntidadeEId() {
        service.historico("CONTRATO", 9L);
        verify(repository).findByEntidadeAndEntidadeIdOrderByDataHoraDescIdAsc("CONTRATO", 9L);
    }
}
