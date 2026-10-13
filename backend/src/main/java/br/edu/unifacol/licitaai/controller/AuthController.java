package br.edu.unifacol.licitaai.controller;

import br.edu.unifacol.licitaai.dto.*;
import br.edu.unifacol.licitaai.repository.UsuarioRepository;
import br.edu.unifacol.licitaai.service.AuthService;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.*;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service; private final UsuarioRepository usuarios;
    public AuthController(AuthService service,UsuarioRepository usuarios){this.service=service;this.usuarios=usuarios;}

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req,HttpServletRequest request){
        var u=service.autenticar(req.email(),req.senha());
        var auth=new UsernamePasswordAuthenticationToken(u.getEmail(),null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getPerfil().name())));
        SecurityContext context=SecurityContextHolder.createEmptyContext(); context.setAuthentication(auth); SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,context);
        return service.resposta(u);
    }
    @GetMapping("/me")
    public AuthResponse me(Principal principal){
        if(principal==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var u=usuarios.findByEmailIgnoreCase(principal.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return service.resposta(u);
    }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request){var s=request.getSession(false);if(s!=null)s.invalidate();SecurityContextHolder.clearContext();}
}
