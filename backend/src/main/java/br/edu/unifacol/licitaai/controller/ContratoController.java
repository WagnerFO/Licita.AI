package br.edu.unifacol.licitaai.controller;

import br.edu.unifacol.licitaai.dto.*;
import br.edu.unifacol.licitaai.service.ContratoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contratos")
public class ContratoController {
    private final ContratoService service;
    public ContratoController(ContratoService service){this.service=service;}
    @GetMapping
    public Page<ContratoResponse> listar(@RequestParam(required=false) String busca,@RequestParam(required=false) String modalidade,@RequestParam(required=false) String situacao,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="15") int size){
        return service.listar(busca,modalidade,situacao,page,size);
    }
    @GetMapping("/{id}") public ContratoResponse buscar(@PathVariable Long id){return service.buscar(id);}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ContratoResponse criar(@Valid @RequestBody ContratoRequest req){return service.criar(req);}
    @PutMapping("/{id}") public ContratoResponse atualizar(@PathVariable Long id,@Valid @RequestBody ContratoRequest req){return service.atualizar(id,req);}
}
