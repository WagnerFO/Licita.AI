package br.edu.unifacol.licitaai.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
public record ContratoResponse(
 Long id,String numero,String processoLicitatorio,String numeroModalidade,String modalidade,
 String empresa,String cnpj,String resumoObjeto,String objeto,BigDecimal valorEstimado,BigDecimal valorTotal,
 String orgaoGestor,String secretario,LocalDate dataAssinatura,LocalDate dataFim,Integer prazoVigenciaMeses,
 String situacao,long diasParaVencimento
){}
