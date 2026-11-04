package br.edu.unifacol.licitaai.controller;

import br.edu.unifacol.licitaai.dto.HistoricoResponse;
import br.edu.unifacol.licitaai.service.AuditoriaService;
import br.edu.unifacol.licitaai.service.ContratoService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/contratos")
public class HistoricoController {
    private final AuditoriaService auditoria;
    private final ContratoService contratos;

    public HistoricoController(AuditoriaService auditoria, ContratoService contratos) {
        this.auditoria = auditoria;
        this.contratos = contratos;
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoResponse> historico(@PathVariable Long id) {
        contratos.buscar(id); // garante 404 se o contrato não existir
        return auditoria.historico("CONTRATO", id).stream().map(HistoricoResponse::de).toList();
    }
}