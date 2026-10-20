import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Contrato, Page } from './models';
@Injectable({providedIn:'root'})
export class ContratoService {
  private readonly api='http://localhost:8080/api/contratos';
  constructor(private http:HttpClient){}
  listar(f:{busca?:string;modalidade?:string;situacao?:string;page?:number;size?:number}){
    let params=new HttpParams().set('page',f.page??0).set('size',f.size??15);
    if(f.busca)params=params.set('busca',f.busca); if(f.modalidade)params=params.set('modalidade',f.modalidade); if(f.situacao)params=params.set('situacao',f.situacao);
    return this.http.get<Page<Contrato>>(this.api,{params,withCredentials:true});
  }
  buscar(id:number){return this.http.get<Contrato>(this.api+'/'+id,{withCredentials:true});}
  criar(dados:Partial<Contrato>){return this.http.post<Contrato>(this.api,dados,{withCredentials:true});}
  atualizar(id:number,dados:Partial<Contrato>){return this.http.put<Contrato>(this.api+'/'+id,dados,{withCredentials:true});}
}
