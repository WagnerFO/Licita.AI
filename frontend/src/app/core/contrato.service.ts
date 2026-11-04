import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, map, tap } from 'rxjs';
import { Contrato, ContratoDados, HistoricoItem, Page } from './models';

@Injectable({providedIn:'root'})
export class ContratoService {
  private readonly http=inject(HttpClient);
  private readonly api='http://localhost:8080/api/contratos';

  /** Emite sempre que um contrato é criado ou alterado, para a lista se atualizar. */
  readonly alteracoes=new Subject<void>();

  listar(f:{busca?:string;modalidade?:string;situacao?:string;page?:number;size?:number}){
    let params=new HttpParams().set('page',f.page??0).set('size',f.size??15);
    if(f.busca)params=params.set('busca',f.busca);
    if(f.modalidade)params=params.set('modalidade',f.modalidade);
    if(f.situacao)params=params.set('situacao',f.situacao);
    return this.http.get<Page<Contrato>>(this.api,{params,withCredentials:true});
  }
  buscar(id:number){return this.http.get<Contrato>(this.api+'/'+id,{withCredentials:true});}
  criar(dados:ContratoDados){
    return this.http.post<Contrato>(this.api,dados,{withCredentials:true}).pipe(tap(()=>this.alteracoes.next()));
  }
  atualizar(id:number,dados:ContratoDados){
    return this.http.put<Contrato>(this.api+'/'+id,dados,{withCredentials:true}).pipe(tap(()=>this.alteracoes.next()));
  }
  historico(id:number){
    return this.http.get<HistoricoItem[]>(this.api+'/'+id+'/historico',{withCredentials:true});
  }
  numeroEmUso(numero:string,ignorarId?:number){
    let params=new HttpParams().set('numero',numero);
    if(ignorarId)params=params.set('ignorarId',ignorarId);
    return this.http.get<{existe:boolean}>(this.api+'/existe',{params,withCredentials:true}).pipe(map(r=>r.existe));
  }
}
