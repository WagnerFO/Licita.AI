package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.entity.Auditoria;
import br.edu.unifacol.licitaai.repository.AuditoriaRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AuditoriaService {
    private final AuditoriaRepository repo;

    public AuditoriaService(AuditoriaRepository repo) { this.repo = repo; }

    @Transactional
    public void registrarCriacao(String entidade, Long entidadeId) {
        repo.save(new Auditoria(UUID.randomUUID(), entidade, entidadeId, "CRIACAO",
                null, null, null, usuarioAtual()));
    }

    @Transactional
    public void registrarAtualizacao(String entidade, Long entidadeId,
                                     Map<String, String> antes, Map<String, String> depois) {
        UUID evento = UUID.randomUUID();
        String usuario = usuarioAtual();
        for (Map.Entry<String, String> e : depois.entrySet()) {
            String anterior = antes.get(e.getKey());
            String novo = e.getValue();
            if (!Objects.equals(anterior, novo)) {
                repo.save(new Auditoria(evento, entidade, entidadeId, "ATUALIZACAO",
                        e.getKey(), anterior, novo, usuario));
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Auditoria> historico(String entidade, Long entidadeId) {
        return repo.findByEntidadeAndEntidadeIdOrderByDataHoraDescIdAsc(entidade, entidadeId);
    }

    private String usuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth == null || auth.getName() == null) ? "sistema" : auth.getName();
    }
}