package br.edu.unifacol.licitaai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String nome;
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(nullable = false, length = 255)
    private String senha;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PerfilUsuario perfil;
    @Column(nullable = false)
    private Boolean ativo = true;
    @Column(name = "tentativas_falhas", nullable = false)
    private Integer tentativasFalhas = 0;
    @Column(name = "bloqueado_ate")
    private LocalDateTime bloqueadoAte;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Usuario() {}
    @PrePersist public void prePersist(){ var agora=LocalDateTime.now(); createdAt=agora; updatedAt=agora; }
    @PreUpdate public void preUpdate(){ updatedAt=LocalDateTime.now(); }
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNome(){return nome;} public void setNome(String nome){this.nome=nome;}
    public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
    public String getSenha(){return senha;} public void setSenha(String senha){this.senha=senha;}
    public PerfilUsuario getPerfil(){return perfil;} public void setPerfil(PerfilUsuario perfil){this.perfil=perfil;}
    public Boolean getAtivo(){return ativo;} public void setAtivo(Boolean ativo){this.ativo=ativo;}
    public Integer getTentativasFalhas(){return tentativasFalhas;} public void setTentativasFalhas(Integer v){this.tentativasFalhas=v;}
    public LocalDateTime getBloqueadoAte(){return bloqueadoAte;} public void setBloqueadoAte(LocalDateTime v){this.bloqueadoAte=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
    public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){this.updatedAt=v;}
}
