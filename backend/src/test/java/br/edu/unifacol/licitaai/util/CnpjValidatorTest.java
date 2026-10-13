package br.edu.unifacol.licitaai.util;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class CnpjValidatorTest {
 @Test void validaCnpj(){assertTrue(CnpjValidator.isValid("08.632.326/0001-43"));assertFalse(CnpjValidator.isValid("08.632.326/0001-44"));assertFalse(CnpjValidator.isValid("11111111111111"));}
}
