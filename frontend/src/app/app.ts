import { Component, OnInit } from '@angular/core'; import { Router, RouterLink, RouterOutlet } from '@angular/router'; import { AuthService } from './core/auth.service';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink],templateUrl:'./app.html',styleUrl:'./app.scss'})
export class App implements OnInit{constructor(public auth:AuthService,private router:Router){}ngOnInit(){this.auth.me().subscribe({error:()=>{}});}sair(){this.auth.logout().subscribe(()=>this.router.navigateByUrl('/login'));}}
