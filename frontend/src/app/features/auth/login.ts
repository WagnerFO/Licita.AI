import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
@Component({selector:'app-login',standalone:true,imports:[ReactiveFormsModule],template:`
<section class="card login-card"><h1>Entrar</h1><p class="muted">Acesso restrito aos usuários autorizados do Licita.AI.</p>
<form [formGroup]="form" (ngSubmit)="entrar()"><label>E-mail</label><input type="email" formControlName="email" autocomplete="username"><label>Senha</label><input type="password" formControlName="senha" autocomplete="current-password">
@if(erro){<div class="alert error">{{erro}}</div>}<button class="btn" [disabled]="form.invalid||carregando">Entrar</button></form></section>`})
export class LoginComponent{
 private fb=inject(FormBuilder); private auth=inject(AuthService); private router=inject(Router); erro='';carregando=false;
 form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],senha:['',Validators.required]});
 entrar(){if(this.form.invalid)return;this.carregando=true;this.erro='';this.auth.login(this.form.value.email!,this.form.value.senha!).subscribe({next:()=>this.router.navigateByUrl('/contratos'),error:e=>{this.erro=e.error?.message??'Não foi possível entrar.';this.carregando=false;}});}
}
