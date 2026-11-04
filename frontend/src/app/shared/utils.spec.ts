import { describe, expect, it } from 'vitest';
import { addMeses, cnpjValido, mascaraCnpj, textoPrazo, valorPorExtenso } from './utils';

describe('valorPorExtenso', () => {
  const casos: [number, string][] = [
    [0, 'zero real'],
    [1, 'um real'],
    [2, 'dois reais'],
    [21, 'vinte e um reais'],
    [100, 'cem reais'],
    [101, 'cento e um reais'],
    [120, 'cento e vinte reais'],
    [1000, 'mil reais'],
    [1001, 'mil e um reais'],
    [1100, 'mil e cem reais'],
    [1234, 'mil duzentos e trinta e quatro reais'],
    [2000, 'dois mil reais'],
    [15300.5, 'quinze mil e trezentos reais e cinquenta centavos'],
    [0.01, 'um centavo'],
    [0.5, 'cinquenta centavos'],
    [1.01, 'um real e um centavo'],
    [1_000_000, 'um milhão de reais'],
    [2_000_000, 'dois milhões de reais'],
    [1_500_000, 'um milhão e quinhentos mil reais'],
    [1_234_567, 'um milhão duzentos e trinta e quatro mil quinhentos e sessenta e sete reais'],
    [2_000_100, 'dois milhões e cem reais'],
    [1_000_000_000, 'um bilhão de reais'],
  ];
  for (const [valor, esperado] of casos) {
    it(`${valor} → ${esperado}`, () => expect(valorPorExtenso(valor)).toBe(esperado));
  }
  it('retorna vazio para valores ausentes ou negativos', () => {
    expect(valorPorExtenso(null)).toBe('');
    expect(valorPorExtenso(undefined)).toBe('');
    expect(valorPorExtenso(-5)).toBe('');
  });
  it('não sofre com arredondamento de ponto flutuante', () => {
    expect(valorPorExtenso(0.1 + 0.2)).toBe('trinta centavos');
  });
});

describe('CNPJ', () => {
  it('valida CNPJs corretos, com ou sem máscara', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11222333000181')).toBe(true);
  });
  it('rejeita dígitos verificadores errados, repetidos e tamanho incorreto', () => {
    expect(cnpjValido('11.222.333/0001-82')).toBe(false);
    expect(cnpjValido('00.000.000/0000-00')).toBe(false);
    expect(cnpjValido('123')).toBe(false);
    expect(cnpjValido('')).toBe(false);
  });
  it('aplica a máscara conforme digita', () => {
    expect(mascaraCnpj('11')).toBe('11');
    expect(mascaraCnpj('112')).toBe('11.2');
    expect(mascaraCnpj('11222333')).toBe('11.222.333');
    expect(mascaraCnpj('112223330001')).toBe('11.222.333/0001');
    expect(mascaraCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(mascaraCnpj('11.222.333/0001-81999')).toBe('11.222.333/0001-81');
  });
});

describe('addMeses', () => {
  it('soma meses mantendo o dia', () => {
    expect(addMeses('2025-03-10', 12)).toBe('2026-03-10');
    expect(addMeses('2025-01-15', 1)).toBe('2025-02-15');
  });
  it('usa o último dia do mês quando o dia não existe', () => {
    expect(addMeses('2025-01-31', 1)).toBe('2025-02-28');
    expect(addMeses('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMeses('2025-08-31', 6)).toBe('2026-02-28');
  });
  it('atravessa a virada de ano', () => {
    expect(addMeses('2025-11-20', 3)).toBe('2026-02-20');
  });
});

describe('textoPrazo', () => {
  it('descreve vencidos, hoje, amanhã e futuros', () => {
    expect(textoPrazo(-1)).toBe('Vencido há 1 dia');
    expect(textoPrazo(-10)).toBe('Vencido há 10 dias');
    expect(textoPrazo(0)).toBe('Vence hoje');
    expect(textoPrazo(1)).toBe('Vence amanhã');
    expect(textoPrazo(45)).toBe('Vence em 45 dias');
  });
});
