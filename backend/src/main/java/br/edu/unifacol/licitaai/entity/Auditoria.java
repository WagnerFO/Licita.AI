package br.edu.unifacol.licitaai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auditoria")
public class Auditoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "evento_id", nullable = false) private UUID eventoId;
    @Column(nullable = false, length = 50) private String entidade;
    @Column(name = "entidade_id", nullable = false) private Long entidadeId;
    @Column(nullable = false, length = 20) private String acao;
    @Column(length = 60) private String campo;
    @Column(name = "valor_anterior", columnDefinition = "TEXT") private String valorAnterior;
    @Column(name = "valor_novo", columnDefinition = "TEXT") private String valorNovo;
    @Column(name = "usuario_email", nullable = false, length = 255) private String usuarioEmail;
    @Column(name = "data_hora", nullable = false) private LocalDateTime dataHora;

    public Auditoria() {}

    public Auditoria(UUID eventoId, String entidade, Long entidadeId, String acao,
                     String campo, String valorAnterior, String valorNovo, String usuarioEmail) {
        this.eventoId = eventoId;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.acao = acao;
        this.campo = campo;
        this.valorAnterior = valorAnterior;
        this.valorNovo = valorNovo;
        this.usuarioEmail = usuarioEmail;
        this.dataHora = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public UUID getEventoId() { return eventoId; }
    public String getEntidade() { return entidade; }
    public Long getEntidadeId() { return entidadeId; }
    public String getAcao() { return acao; }
    public String getCampo() { return campo; }
    public String getValorAnterior() { return valorAnterior; }
    public String getValorNovo() { return valorNovo; }
    public String getUsuarioEmail() { return usuarioEmail; }
    public LocalDateTime getDataHora() { return dataHora; }
}