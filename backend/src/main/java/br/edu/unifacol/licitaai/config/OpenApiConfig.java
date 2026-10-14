package br.edu.unifacol.licitaai.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.*;
@Configuration
public class OpenApiConfig {
 @Bean OpenAPI licitaApi(){return new OpenAPI().info(new Info().title("Licita.AI API").version("v1").description("API REST para gerenciamento das informações de contratos e processos licitatórios."));}
}
