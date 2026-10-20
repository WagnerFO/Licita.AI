package br.edu.unifacol.licitaai.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
public record ContratoRequest(
 @NotBlank @Size(max=30) String numero,
 @NotBlank @Size(max=30) String processoLicitatorio,
 @Size(max=30) String numeroModalidade,
 @NotBlank @Size(max=80) String modalidade,
 @NotBlank @Size(max=200) String empresa,
 @NotBlank @Size(max=18) String cnpj,
 @NotBlank @Size(max=200) String resumoObjeto,
 @NotBlank @Size(max=5000) String objeto,
 @PositiveOrZero @Digits(integer=13,fraction=2) BigDecimal valorEstimado,
 @NotNull @PositiveOrZero @Digits(integer=13,fraction=2) BigDecimal valorTotal,
 @NotBlank @Size(max=150) String orgaoGestor,
 @Size(max=150) String secretario,
 @NotNull LocalDate dataAssinatura,
 @NotNull LocalDate dataFim,
 @Min(1) @Max(600) Integer prazoVigenciaMeses
){}
