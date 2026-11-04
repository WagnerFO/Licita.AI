import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login';
import { ContratosListaComponent } from './features/contratos/contratos-lista';
import { ContratoDetalheComponent } from './features/contratos/contrato-detalhe';
import { ContratoFormComponent } from './features/contratos/contrato-form';

/**
 * A lista é a tela principal. Detalhe, cadastro e edição abrem no painel lateral:
 * são rotas filhas da lista, renderizadas no <router-outlet> do painel.
 * ('novo' vem antes de ':id' para não ser confundido com um id.)
 */
export const routes: Routes=[
  {path:'login',component:LoginComponent},
  {path:'contratos',component:ContratosListaComponent,children:[
    {path:'novo',component:ContratoFormComponent},
    {path:':id/editar',component:ContratoFormComponent},
    {path:':id',component:ContratoDetalheComponent},
  ]},
  {path:'',pathMatch:'full',redirectTo:'contratos'},
  {path:'**',redirectTo:'contratos'}
];
