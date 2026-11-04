export interface Usuario { id:number; nome:string; email:string; perfil:'ADMIN'|'CONSULTA'; }
export type Situacao='VENCIDO'|'A_VENCER'|'NO_PRAZO';
export interface Contrato {
  id:number; numero:string; processoLicitatorio:string; numeroModalidade?:string|null; modalidade:string;
  empresa:string; cnpj:string; resumoObjeto:string; objeto:string; valorEstimado?:number|null; valorTotal:number;
  orgaoGestor:string; secretario?:string|null; dataAssinatura:string; dataFim:string; prazoVigenciaMeses?:number|null;
  situacao:Situacao; diasParaVencimento:number;
}
export interface Page<T>{content:T[];totalElements:number;totalPages:number;number:number;size:number;}
export interface HistoricoItem {
  eventoId:string; acao:'CRIACAO'|'ATUALIZACAO'; campo:string|null;
  valorAnterior:string|null; valorNovo:string|null; usuarioEmail:string; dataHora:string;
}
/** Dados enviados pelo formulário de cadastro/edição (valores ainda podem estar vazios durante o preenchimento). */
export interface ContratoDados {
  numero:string; processoLicitatorio:string; numeroModalidade:string; modalidade:string; empresa:string; cnpj:string;
  resumoObjeto:string; objeto:string; valorEstimado:number|null; valorTotal:number|null; orgaoGestor:string; secretario:string;
  dataAssinatura:string; dataFim:string; prazoVigenciaMeses:number|null;
}
