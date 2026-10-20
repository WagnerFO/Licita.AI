import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Usuario } from './models';
@Injectable({providedIn:'root'})
export class AuthService {
  private readonly api='http://localhost:8080/api/auth';
  readonly usuario=signal<Usuario|null>(null);
  constructor(private http:HttpClient){}
  login(email:string,senha:string){return this.http.post<Usuario>(this.api+'/login',{email,senha},{withCredentials:true}).pipe(tap(u=>this.usuario.set(u)));}
  me(){return this.http.get<Usuario>(this.api+'/me',{withCredentials:true}).pipe(tap(u=>this.usuario.set(u)));}
  logout(){return this.http.post<void>(this.api+'/logout',{}, {withCredentials:true}).pipe(tap(()=>this.usuario.set(null)));}
}
