import { Situacao } from '../core/models';

/* ---------- CNPJ ---------- */

export function mascaraCnpj(valor: string): string {
  const d = (valor ?? '').replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function cnpjValido(valor: string): boolean {
  const d = (valor ?? '').replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const digito = (base: string): number => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = digito(d.slice(0, 12));
  const d2 = digito(d.slice(0, 12) + d1);
  return d === d.slice(0, 12) + d1 + d2;
}

/* ---------- Datas ---------- */

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Soma meses a uma data ISO (yyyy-MM-dd). Segue a regra do Código Civil (art. 132, §3º):
 * o prazo em meses termina no dia de igual número; se o mês não tiver esse dia, no último dia do mês.
 */
export function addMeses(iso: string, meses: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const alvo = new Date(ano, mes - 1 + meses, 1);
  const ultimoDia = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  alvo.setDate(Math.min(dia, ultimoDia));
  return `${alvo.getFullYear()}-${doisDigitos(alvo.getMonth() + 1)}-${doisDigitos(alvo.getDate())}`;
}

/* ---------- Situação do contrato ---------- */

export function rotuloSituacao(s: Situacao): string {
  return s === 'NO_PRAZO' ? 'No prazo' : s === 'A_VENCER' ? 'Vence em breve' : 'Vencido';
}

export function classeSituacao(s: Situacao): 'ok' | 'alerta' | 'erro' {
  return s === 'NO_PRAZO' ? 'ok' : s === 'A_VENCER' ? 'alerta' : 'erro';
}

export function textoPrazo(dias: number): string {
  if (dias < 0) return `Vencido há ${-dias} ${-dias === 1 ? 'dia' : 'dias'}`;
  if (dias === 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  return `Vence em ${dias} dias`;
}

/* ---------- Valor por extenso (R$) ---------- */

const UNIDADES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze',
  'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos',
  'oitocentos', 'novecentos'];
const ESCALA_SING = ['', 'mil', 'milhão', 'bilhão', 'trilhão'];
const ESCALA_PLUR = ['', 'mil', 'milhões', 'bilhões', 'trilhões'];

function ate999(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c]);
  if (r) {
    if (r < 20) {
      partes.push(UNIDADES[r]);
    } else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      partes.push(u ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
    }
  }
  return partes.join(' e ');
}

function reaisPorExtenso(n: number): string {
  if (n === 0) return 'zero real';
  const grupos: number[] = [];
  let resto = n;
  while (resto > 0) {
    grupos.push(resto % 1000);
    resto = Math.floor(resto / 1000);
  }
  const itens: { texto: string; valor: number }[] = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i];
    if (g === 0) continue;
    let texto: string;
    if (i === 0) texto = ate999(g);
    else if (i === 1) texto = g === 1 ? 'mil' : `${ate999(g)} mil`;
    else texto = `${ate999(g)} ${g === 1 ? ESCALA_SING[i] : ESCALA_PLUR[i]}`;
    itens.push({ texto, valor: g });
  }
  let texto = itens[0].texto;
  for (let k = 1; k < itens.length; k++) {
    const ultimo = k === itens.length - 1;
    const liga = ultimo && (itens[k].valor < 100 || itens[k].valor % 100 === 0) ? ' e ' : ' ';
    texto += liga + itens[k].texto;
  }
  const sufixo = n === 1 ? 'real' : n % 1_000_000 === 0 ? 'de reais' : 'reais';
  return `${texto} ${sufixo}`;
}

export function valorPorExtenso(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !isFinite(valor) || valor < 0) return '';
  const centavosTotal = Math.round(valor * 100);
  const reais = Math.floor(centavosTotal / 100);
  const centavos = centavosTotal % 100;
  if (reais >= 1e15) return '';
  const partes: string[] = [];
  if (reais > 0 || centavos === 0) partes.push(reaisPorExtenso(reais));
  if (centavos > 0) partes.push(`${ate999(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`);
  return partes.join(' e ');
}
