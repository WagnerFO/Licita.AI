import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({selector:'app-login',standalone:true,imports:[ReactiveFormsModule],template:`
<section class="card login-card">
  <div>
    <h1>Entrar</h1>
    <p class="muted">Acesso restrito aos usuários autorizados do Licita.AI.</p>
  </div>
  <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
    <div class="campo">
      <label for="login-email">E-mail</label>
      <input id="login-email" type="email" formControlName="email" autocomplete="username">
    </div>
    <div class="campo">
      <label for="login-senha">Senha</label>
      <input id="login-senha" type="password" formControlName="senha" autocomplete="current-password">
    </div>
    @if (erro()) { <div class="alert error" role="alert">{{ erro() }}</div> }
    <button class="btn" type="submit" [disabled]="form.invalid || carregando()">{{ carregando() ? 'Entrando…' : 'Entrar' }}</button>
  </form>
</section>`})
export class LoginComponent{
  private fb=inject(FormBuilder);
  private auth=inject(AuthService);
  private router=inject(Router);

  // signals: o app é "zoneless", então só signals (e eventos) atualizam a tela depois de uma resposta HTTP
  readonly erro=signal('');
  readonly carregando=signal(false);

  form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],senha:['',Validators.required]});

  entrar(){
    if(this.form.invalid)return;
    this.carregando.set(true);
    this.erro.set('');
    const {email,senha}=this.form.getRawValue();
    this.auth.login(email,senha).subscribe({
      next:()=>this.router.navigateByUrl('/contratos'),
      error:e=>{
        this.erro.set(e.error?.message ?? (e.status===401?'E-mail ou senha inválidos.':e.status===0?'Não foi possível conectar ao servidor.':'Não foi possível entrar.'));
        this.carregando.set(false);
      }
    });
  }
}
