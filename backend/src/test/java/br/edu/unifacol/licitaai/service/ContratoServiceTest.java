package br.edu.unifacol.licitaai.service;
import br.edu.unifacol.licitaai.dto.ContratoRequest;
import br.edu.unifacol.licitaai.repository.ContratoRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class ContratoServiceTest {
 @Mock ContratoRepository repository;
 @InjectMocks ContratoService service;
 private ContratoRequest valido(){
  return new ContratoRequest("002/2023","103/2022","053/2022","Pregão Eletrônico","Empresa Teste","08.632.326/0001-43","Transporte escolar","Prestação de serviço.",new BigDecimal("10245296.11"),new BigDecimal("8999899.91"),"Secretaria de Educação","Fulano",LocalDate.of(2023,1,4),LocalDate.of(2030,1,4),24);
 }
 @Test void rejeitaNumeroDuplicado(){when(repository.existsByNumeroIgnoreCase("002/2023")).thenReturn(true);assertThrows(ResponseStatusException.class,()->service.criar(valido()));}
 @Test void rejeitaDataFinalAnterior(){var r=valido();var invalido=new ContratoRequest(r.numero(),r.processoLicitatorio(),r.numeroModalidade(),r.modalidade(),r.empresa(),r.cnpj(),r.resumoObjeto(),r.objeto(),r.valorEstimado(),r.valorTotal(),r.orgaoGestor(),r.secretario(),LocalDate.of(2024,1,2),LocalDate.of(2024,1,1),r.prazoVigenciaMeses());assertThrows(ResponseStatusException.class,()->service.criar(invalido));verify(repository,never()).save(any());}
}
