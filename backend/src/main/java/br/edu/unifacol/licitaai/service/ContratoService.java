package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.dto.*;
import br.edu.unifacol.licitaai.entity.Contrato;
import br.edu.unifacol.licitaai.repository.ContratoRepository;
import br.edu.unifacol.licitaai.util.CnpjValidator;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ContratoService {
    public static final int DIAS_ALERTA=60;
    public static final Set<String> MODALIDADES=Set.of("Adesão a Ata","Ata de Registro de Preço","Chamada Publica","Concorrência Publica","Dispensa","Inexigibilidade","Pregão Eletrônico","Processo Administrativo","Tomada de Preço");
    private final ContratoRepository repository;
    public ContratoService(ContratoRepository repository){this.repository=repository;}

    @Transactional(readOnly=true)
    public Page<ContratoResponse> listar(String busca,String modalidade,String situacao,int page,int size){
        Specification<Contrato> spec=(root,q,cb)->{
            List<Predicate> ps=new ArrayList<>();
            if(busca!=null&&!busca.isBlank()){
                String termo="%"+busca.trim().toLowerCase()+"%";
                ps.add(cb.or(cb.like(cb.lower(root.get("numero")),termo),cb.like(cb.lower(root.get("processoLicitatorio")),termo),cb.like(cb.lower(root.get("empresa")),termo),cb.like(cb.lower(root.get("resumoObjeto")),termo),cb.like(cb.lower(root.get("objeto")),termo)));
            }
            if(modalidade!=null&&!modalidade.isBlank()) ps.add(cb.equal(root.get("modalidade"),modalidade));
            LocalDate hoje=LocalDate.now(), limite=hoje.plusDays(DIAS_ALERTA);
            if("no_prazo".equals(situacao)) ps.add(cb.greaterThan(root.get("dataFim"),limite));
            if("a_vencer".equals(situacao)) ps.add(cb.between(root.get("dataFim"),hoje,limite));
            if("vencido".equals(situacao)) ps.add(cb.lessThan(root.get("dataFim"),hoje));
            return cb.and(ps.toArray(Predicate[]::new));
        };
        Pageable pageable=PageRequest.of(Math.max(page,0),Math.min(Math.max(size,1),100),Sort.by(Sort.Direction.DESC,"dataAssinatura","id"));
        return repository.findAll(spec,pageable).map(this::toResponse);
    }

    @Transactional(readOnly=true)
    public ContratoResponse buscar(Long id){return toResponse(entidade(id));}

    @Transactional
    public ContratoResponse criar(ContratoRequest req){
        validar(req,null);
        Contrato c=new Contrato(); aplicar(c,req); return toResponse(repository.save(c));
    }

    @Transactional
    public ContratoResponse atualizar(Long id,ContratoRequest req){
        Contrato c=entidade(id); validar(req,id); aplicar(c,req); return toResponse(repository.save(c));
    }

    private Contrato entidade(Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contrato não encontrado."));}
    private void validar(ContratoRequest r,Long id){
        if(!CnpjValidator.isValid(r.cnpj())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"CNPJ inválido.");
        if(r.dataFim().isBefore(r.dataAssinatura())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A data de fim não pode ser anterior à assinatura.");
        if(!MODALIDADES.contains(r.modalidade())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Modalidade inválida.");
        boolean dup=id==null?repository.existsByNumeroIgnoreCase(r.numero()):repository.existsByNumeroIgnoreCaseAndIdNot(r.numero(),id);
        if(dup) throw new ResponseStatusException(HttpStatus.CONFLICT,"Já existe um contrato com esse número.");
    }
    private void aplicar(Contrato c,ContratoRequest r){
        c.setNumero(r.numero().trim());c.setProcessoLicitatorio(r.processoLicitatorio().trim());c.setNumeroModalidade(trim(r.numeroModalidade()));
        c.setModalidade(r.modalidade());c.setEmpresa(r.empresa().trim());c.setCnpj(CnpjValidator.format(r.cnpj()));c.setResumoObjeto(r.resumoObjeto().trim());
        c.setObjeto(r.objeto().trim());c.setValorEstimado(r.valorEstimado());c.setValorTotal(r.valorTotal());c.setOrgaoGestor(r.orgaoGestor().trim());
        c.setSecretario(trim(r.secretario()));c.setDataAssinatura(r.dataAssinatura());c.setDataFim(r.dataFim());c.setPrazoVigenciaMeses(r.prazoVigenciaMeses());
    }
    private String trim(String s){return s==null||s.isBlank()?null:s.trim();}
    public ContratoResponse toResponse(Contrato c){
        long dias=ChronoUnit.DAYS.between(LocalDate.now(),c.getDataFim());
        String sit=dias<0?"VENCIDO":dias<=DIAS_ALERTA?"A_VENCER":"NO_PRAZO";
        return new ContratoResponse(c.getId(),c.getNumero(),c.getProcessoLicitatorio(),c.getNumeroModalidade(),c.getModalidade(),c.getEmpresa(),c.getCnpj(),c.getResumoObjeto(),c.getObjeto(),c.getValorEstimado(),c.getValorTotal(),c.getOrgaoGestor(),c.getSecretario(),c.getDataAssinatura(),c.getDataFim(),c.getPrazoVigenciaMeses(),sit,dias);
    }
}
