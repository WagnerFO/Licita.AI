export interface Usuario { id:number; nome:string; email:string; perfil:'ADMIN'|'CONSULTA'; }
export interface Contrato {
  id:number; numero:string; processoLicitatorio:string; numeroModalidade?:string|null; modalidade:string;
  empresa:string; cnpj:string; resumoObjeto:string; objeto:string; valorEstimado?:number|null; valorTotal:number;
  orgaoGestor:string; secretario?:string|null; dataAssinatura:string; dataFim:string; prazoVigenciaMeses?:number|null;
  situacao:'VENCIDO'|'A_VENCER'|'NO_PRAZO'; diasParaVencimento:number;
}
export interface Page<T>{content:T[];totalElements:number;totalPages:number;number:number;size:number;}
