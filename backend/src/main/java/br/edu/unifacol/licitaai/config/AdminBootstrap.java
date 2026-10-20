package br.edu.unifacol.licitaai.config;

import br.edu.unifacol.licitaai.entity.PerfilUsuario;
import br.edu.unifacol.licitaai.entity.Usuario;
import br.edu.unifacol.licitaai.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    @Value("${licitaai.admin.nome:}") private String nome;
    @Value("${licitaai.admin.email:}") private String email;
    @Value("${licitaai.admin.password:}") private String password;

    public AdminBootstrap(UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) return;
        if (password.length() < 10) throw new IllegalStateException("LICITAAI_ADMIN_PASSWORD deve ter pelo menos 10 caracteres.");
        if (usuarios.findByEmailIgnoreCase(email.trim()).isPresent()) return;

        Usuario u = new Usuario();
        u.setNome(nome == null || nome.isBlank() ? "Administrador" : nome.trim());
        u.setEmail(email.trim().toLowerCase());
        u.setSenha(encoder.encode(password));
        u.setPerfil(PerfilUsuario.ADMIN);
        u.setAtivo(true);
        usuarios.save(u);
    }
}
