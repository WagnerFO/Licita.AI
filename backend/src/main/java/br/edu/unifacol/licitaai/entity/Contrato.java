package br.edu.unifacol.licitaai.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contrato")
public class Contrato {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, unique=true, length=30) private String numero;
    @Column(name="processo_licitatorio", nullable=false, length=30) private String processoLicitatorio;
    @Column(name="numero_modalidade", length=30) private String numeroModalidade;
    @Column(nullable=false, length=80) private String modalidade;
    @Column(nullable=false, length=200) private String empresa;
    @Column(nullable=false, length=18) private String cnpj;
    @Column(name="resumo_objeto", nullable=false, length=200) private String resumoObjeto;
    @Column(nullable=false, columnDefinition="TEXT") private String objeto;
    @Column(name="valor_estimado", precision=15, scale=2) private BigDecimal valorEstimado;
    @Column(name="valor_total", nullable=false, precision=15, scale=2) private BigDecimal valorTotal;
    @Column(name="orgao_gestor", nullable=false, length=150) private String orgaoGestor;
    @Column(length=150) private String secretario;
    @Column(name="data_assinatura", nullable=false) private LocalDate dataAssinatura;
    @Column(name="data_fim", nullable=false) private LocalDate dataFim;
    @Column(name="prazo_vigencia_meses") private Integer prazoVigenciaMeses;
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt;

    public Contrato(){}
    @PrePersist public void prePersist(){var agora=LocalDateTime.now();createdAt=agora;updatedAt=agora;}
    @PreUpdate public void preUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getNumero(){return numero;} public void setNumero(String v){numero=v;}
    public String getProcessoLicitatorio(){return processoLicitatorio;} public void setProcessoLicitatorio(String v){processoLicitatorio=v;}
    public String getNumeroModalidade(){return numeroModalidade;} public void setNumeroModalidade(String v){numeroModalidade=v;}
    public String getModalidade(){return modalidade;} public void setModalidade(String v){modalidade=v;}
    public String getEmpresa(){return empresa;} public void setEmpresa(String v){empresa=v;}
    public String getCnpj(){return cnpj;} public void setCnpj(String v){cnpj=v;}
    public String getResumoObjeto(){return resumoObjeto;} public void setResumoObjeto(String v){resumoObjeto=v;}
    public String getObjeto(){return objeto;} public void setObjeto(String v){objeto=v;}
    public BigDecimal getValorEstimado(){return valorEstimado;} public void setValorEstimado(BigDecimal v){valorEstimado=v;}
    public BigDecimal getValorTotal(){return valorTotal;} public void setValorTotal(BigDecimal v){valorTotal=v;}
    public String getOrgaoGestor(){return orgaoGestor;} public void setOrgaoGestor(String v){orgaoGestor=v;}
    public String getSecretario(){return secretario;} public void setSecretario(String v){secretario=v;}
    public LocalDate getDataAssinatura(){return dataAssinatura;} public void setDataAssinatura(LocalDate v){dataAssinatura=v;}
    public LocalDate getDataFim(){return dataFim;} public void setDataFim(LocalDate v){dataFim=v;}
    public Integer getPrazoVigenciaMeses(){return prazoVigenciaMeses;} public void setPrazoVigenciaMeses(Integer v){prazoVigenciaMeses=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
