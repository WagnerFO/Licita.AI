package br.edu.unifacol.licitaai.exception;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex){
   Map<String,String> campos=new LinkedHashMap<>();ex.getBindingResult().getFieldErrors().forEach(e->campos.putIfAbsent(e.getField(),e.getDefaultMessage()));
   return ResponseEntity.badRequest().body(Map.of("message","Dados inválidos.","fields",campos));
 }
 @ExceptionHandler(BadCredentialsException.class)
 ResponseEntity<Map<String,String>> auth(BadCredentialsException ex){return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(ResponseStatusException.class)
 ResponseEntity<Map<String,String>> status(ResponseStatusException ex){return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message",ex.getReason()==null?"Erro na requisição.":ex.getReason()));}
}
