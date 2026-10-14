package br.edu.unifacol.licitaai.service;

import br.edu.unifacol.licitaai.dto.AuthResponse;
import br.edu.unifacol.licitaai.entity.Usuario;
import br.edu.unifacol.licitaai.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class AuthService {
    private static final int MAX_TENTATIVAS=5;
    private static final int BLOQUEIO_MINUTOS=15;
    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;
    public AuthService(UsuarioRepository repository,PasswordEncoder encoder){this.repository=repository;this.encoder=encoder;}

    @Transactional
    public Usuario autenticar(String email,String senha){
        Usuario usuario=repository.findByEmailIgnoreCase(email.trim()).orElse(null);
        if(usuario==null){encoder.matches(senha,"$2a$10$7EqJtq98hPqEX7fNZaFWoOhi9u2VQZQ5G1H5Q5H5Q5H5Q5H5Q5H5Q");throw erro();}
        var agora=LocalDateTime.now();
        boolean bloqueado=usuario.getBloqueadoAte()!=null && usuario.getBloqueadoAte().isAfter(agora);
        boolean senhaOk=encoder.matches(senha,usuario.getSenha());
        if(!Boolean.TRUE.equals(usuario.getAtivo()) || bloqueado || !senhaOk){
            if(Boolean.TRUE.equals(usuario.getAtivo()) && !bloqueado) registrarFalha(usuario,agora);
            throw erro();
        }
        usuario.setTentativasFalhas(0); usuario.setBloqueadoAte(null); repository.save(usuario);
        return usuario;
    }
    private void registrarFalha(Usuario usuario,LocalDateTime agora){
        int tentativas=(usuario.getTentativasFalhas()==null?0:usuario.getTentativasFalhas())+1;
        if(tentativas>=MAX_TENTATIVAS){usuario.setTentativasFalhas(0);usuario.setBloqueadoAte(agora.plusMinutes(BLOQUEIO_MINUTOS));}
        else usuario.setTentativasFalhas(tentativas);
        repository.save(usuario);
    }
    private BadCredentialsException erro(){return new BadCredentialsException("E-mail ou senha inválidos, ou conta temporariamente bloqueada.");}
    public AuthResponse resposta(Usuario u){return new AuthResponse(u.getId(),u.getNome(),u.getEmail(),u.getPerfil().name());}
}
