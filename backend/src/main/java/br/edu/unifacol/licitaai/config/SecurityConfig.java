package br.edu.unifacol.licitaai.config;

import br.edu.unifacol.licitaai.repository.UsuarioRepository;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()).csrf(csrf->csrf.disable())
            .authorizeHttpRequests(auth->auth
                .requestMatchers("/api/status","/api/auth/login","/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/contratos/**").hasAnyRole("ADMIN","CONSULTA")
                .requestMatchers("/api/contratos/**").hasRole("ADMIN")
                .anyRequest().authenticated());
        return http.build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource(){
        var c=new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:4200"));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*")); c.setAllowCredentials(true);
        var s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s;
    }
}
