import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, debounceTime, filter, forkJoin, switchMap, tap } from 'rxjs';
import { ContratoService } from '../../core/contrato.service';
import { AuthService } from '../../core/auth.service';
import { Contrato } from '../../core/models';
import { DIAS_ALERTA, MODALIDADES } from '../../shared/constantes';
import { classeSituacao, rotuloSituacao, textoPrazo } from '../../shared/utils';

type FiltroSituacao = '' | 'no_prazo' | 'a_vencer' | 'vencido';

@Component({
  selector: 'app-contratos-lista',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, RouterOutlet],
  template: `
<div class="page-head">
  <div>
    <h1>Contratos</h1>
    <p class="muted">Consulte, acompanhe prazos e abra um contrato para ver todos os detalhes.</p>
  </div>
  @if (auth.usuario()?.perfil === 'ADMIN') {
    <a class="btn" routerLink="/contratos/novo">+ Novo contrato</a>
  }
</div>

<section class="resumo" aria-label="Resumo por situação">
  <button type="button" class="resumo-card" [class.ativo]="situacao() === ''" [attr.aria-pressed]="situacao() === ''" (click)="filtrarSituacao('')">
    <strong>{{ resumo() ? resumo()!.noPrazo + resumo()!.aVencer + resumo()!.vencido : '—' }}</strong><span>Todos os contratos</span>
  </button>
  <button type="button" class="resumo-card ok" [class.ativo]="situacao() === 'no_prazo'" [attr.aria-pressed]="situacao() === 'no_prazo'" (click)="filtrarSituacao('no_prazo')">
    <strong>{{ resumo()?.noPrazo ?? '—' }}</strong><span>No prazo</span>
  </button>
  <button type="button" class="resumo-card alerta" [class.ativo]="situacao() === 'a_vencer'" [attr.aria-pressed]="situacao() === 'a_vencer'" (click)="filtrarSituacao('a_vencer')">
    <strong>{{ resumo()?.aVencer ?? '—' }}</strong><span>Vencem em até {{ diasAlerta }} dias</span>
  </button>
  <button type="button" class="resumo-card erro" [class.ativo]="situacao() === 'vencido'" [attr.aria-pressed]="situacao() === 'vencido'" (click)="filtrarSituacao('vencido')">
    <strong>{{ resumo()?.vencido ?? '—' }}</strong><span>Vencidos</span>
  </button>
</section>

<div class="filtros" role="search">
  <input type="search" aria-label="Buscar contratos" placeholder="Buscar por número, empresa, processo ou objeto"
         [value]="busca()" (input)="aoDigitar($any($event.target).value)" (keydown.enter)="buscarPrimeira()">
  <select aria-label="Filtrar por modalidade" (change)="aoMudarModalidade($any($event.target).value)">
    <option value="" [selected]="modalidade() === ''">Todas as modalidades</option>
    @for (m of modalidades; track m) { <option [value]="m" [selected]="m === modalidade()">{{ m }}</option> }
  </select>
  <select aria-label="Filtrar por situação" (change)="filtrarSituacao($any($event.target).value)">
    <option value="" [selected]="situacao() === ''">Todas as situações</option>
    <option value="no_prazo" [selected]="situacao() === 'no_prazo'">No prazo</option>
    <option value="a_vencer" [selected]="situacao() === 'a_vencer'">Vence em breve</option>
    <option value="vencido" [selected]="situacao() === 'vencido'">Vencido</option>
  </select>
  <button type="button" class="btn secundario" (click)="limpar()">Limpar</button>
</div>

@if (erro()) { <div class="alert error" role="alert">{{ erro() }}</div> }

<div class="tabela-wrap" [attr.aria-busy]="carregando()">
  @if (contratos().length) {
    <table>
      <thead>
        <tr><th>Nº</th><th>Empresa</th><th>Objeto</th><th class="num">Valor</th><th>Vigência até</th><th>Situação</th></tr>
      </thead>
      <tbody>
        @for (c of contratos(); track c.id) {
          <tr [class.selecionada]="idSelecionado() === c.id" (click)="abrir(c)">
            <td class="col-num"><a [routerLink]="['/contratos', c.id]" (click)="$event.stopPropagation()">{{ c.numero }}</a></td>
            <td><span class="forte">{{ c.empresa }}</span><small class="sub">{{ c.cnpj }}</small></td>
            <td class="col-objeto">{{ c.resumoObjeto }}</td>
            <td class="num">{{ c.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td>
            <td><span class="forte">{{ c.dataFim | date:'dd/MM/yyyy' }}</span><small class="sub">{{ prazo(c) }}</small></td>
            <td><span [class]="'chip ' + classe(c.situacao)">{{ rotulo(c.situacao) }}</span></td>
          </tr>
        }
      </tbody>
    </table>
  } @else if (!carregando()) {
    <div class="vazio">
      <p>Nenhum contrato encontrado com esses filtros.</p>
      <button type="button" class="btn secundario" (click)="limpar()">Limpar filtros</button>
    </div>
  } @else {
    <div class="vazio"><p>Carregando contratos…</p></div>
  }
</div>

<nav class="paginacao" aria-label="Paginação">
  <button type="button" class="btn secundario" [disabled]="pagina() === 0" (click)="irParaPagina(pagina() - 1)">Anterior</button>
  <span>Página {{ pagina() + 1 }} de {{ totalPaginas() || 1 }} · {{ total() }} {{ total() === 1 ? 'contrato' : 'contratos' }}</span>
  <button type="button" class="btn secundario" [disabled]="pagina() + 1 >= totalPaginas()" (click)="irParaPagina(pagina() + 1)">Próxima</button>
</nav>

<!-- Painel lateral: detalhe, cadastro e edição são rotas filhas renderizadas aqui -->
<div class="drawer-backdrop" [class.aberto]="painelAberto()" (click)="fecharPainel(painel)" aria-hidden="true"></div>
<aside #drawer class="drawer" [class.aberto]="painelAberto()" role="dialog" aria-modal="true"
       aria-label="Painel do contrato" tabindex="-1" (keydown)="prenderFoco($event)">
  <router-outlet #painel="outlet" />
</aside>`
})
export class ContratosListaComponent implements OnInit, OnDestroy {
  private readonly service = inject(ContratoService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');

  readonly modalidades = MODALIDADES;
  readonly diasAlerta = DIAS_ALERTA;

  // Estado em signals: o app é "zoneless", então só signals atualizam a tela após respostas HTTP.
  readonly contratos = signal<Contrato[]>([]);
  readonly busca = signal('');
  readonly modalidade = signal('');
  readonly situacao = signal<FiltroSituacao>('');
  readonly pagina = signal(0);
  readonly total = signal(0);
  readonly totalPaginas = signal(0);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly resumo = signal<{ noPrazo: number; aVencer: number; vencido: number } | null>(null);
  readonly painelAberto = signal(false);
  readonly idSelecionado = signal<number | null>(null);

  private readonly consulta$ = new Subject<number>();
  private readonly resumo$ = new Subject<void>();
  private readonly busca$ = new Subject<void>();
  private gatilho: HTMLElement | null = null;

  constructor() {
    // Lista: switchMap cancela a consulta anterior se o usuário digitar/filtrar de novo (evita resposta fora de ordem)
    this.consulta$.pipe(
      tap(() => { this.carregando.set(true); this.erro.set(''); }),
      switchMap(page => this.service.listar({
        busca: this.busca(), modalidade: this.modalidade(), situacao: this.situacao(), page
      }).pipe(catchError(e => this.tratarErro(e, 'Erro ao consultar contratos.')))),
      takeUntilDestroyed()
    ).subscribe(r => {
      this.contratos.set(r.content);
      this.pagina.set(r.number);
      this.total.set(r.totalElements);
      this.totalPaginas.set(r.totalPages);
      this.carregando.set(false);
    });

    // Cards de resumo: contagem por situação, respeitando a busca e a modalidade escolhidas
    this.resumo$.pipe(
      switchMap(() => {
        const base = { busca: this.busca(), modalidade: this.modalidade(), page: 0, size: 1 };
        return forkJoin({
          noPrazo: this.service.listar({ ...base, situacao: 'no_prazo' }),
          aVencer: this.service.listar({ ...base, situacao: 'a_vencer' }),
          vencido: this.service.listar({ ...base, situacao: 'vencido' })
        }).pipe(catchError(() => { this.resumo.set(null); return EMPTY; }));
      }),
      takeUntilDestroyed()
    ).subscribe(r => this.resumo.set({
      noPrazo: r.noPrazo.totalElements, aVencer: r.aVencer.totalElements, vencido: r.vencido.totalElements
    }));

    this.busca$.pipe(debounceTime(350), takeUntilDestroyed()).subscribe(() => this.buscarPrimeira());

    // Atualiza a lista quando um contrato é criado ou editado no painel
    this.service.alteracoes.pipe(takeUntilDestroyed()).subscribe(() => {
      this.consulta$.next(this.pagina());
      this.resumo$.next();
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.sincronizarPainel());
  }

  ngOnInit() {
    this.sincronizarPainel();
    this.auth.me().subscribe({
      next: () => this.buscarPrimeira(),
      error: () => this.router.navigateByUrl('/login')
    });
  }

  ngOnDestroy() { document.body.classList.remove('com-painel'); }

  /* ---------- filtros e paginação ---------- */
  buscarPrimeira() { this.consulta$.next(0); this.resumo$.next(); }
  irParaPagina(p: number) { this.consulta$.next(p); }
  aoDigitar(v: string) { this.busca.set(v); this.busca$.next(); }
  aoMudarModalidade(v: string) { this.modalidade.set(v); this.buscarPrimeira(); }
  filtrarSituacao(v: string) {
    const novo = (v === this.situacao() ? '' : v) as FiltroSituacao; // clicar de novo no card remove o filtro
    this.situacao.set(novo);
    this.consulta$.next(0);
  }
  limpar() { this.busca.set(''); this.modalidade.set(''); this.situacao.set(''); this.buscarPrimeira(); }

  /* ---------- apresentação ---------- */
  rotulo = rotuloSituacao;
  classe = classeSituacao;
  prazo(c: Contrato) { return textoPrazo(c.diasParaVencimento); }

  /* ---------- painel lateral ---------- */
  abrir(c: Contrato) { this.router.navigate(['/contratos', c.id]); }

  fecharPainel(outlet: RouterOutlet) {
    const comp = outlet.isActivated ? (outlet.component as { fechar?: () => void }) : null;
    if (comp?.fechar) comp.fechar();      // o formulário pergunta antes de descartar alterações
    else this.router.navigate(['/contratos']);
  }

  /** Mantém o Tab dentro do painel enquanto ele está aberto (é um diálogo modal). */
  prenderFoco(ev: KeyboardEvent) {
    if (ev.key !== 'Tab') return;
    const el = this.drawer()?.nativeElement;
    if (!el) return;
    const focaveis = Array.from(el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(x => x.offsetParent !== null);
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativo = document.activeElement;
    if (ev.shiftKey && (ativo === primeiro || ativo === el)) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && ativo === ultimo) { ev.preventDefault(); primeiro.focus(); }
  }

  private sincronizarPainel() {
    const filho = this.route.firstChild;
    const aberto = !!filho;
    const id = Number(filho?.snapshot.paramMap.get('id'));
    this.idSelecionado.set(aberto && id > 0 ? id : null);

    const antes = this.painelAberto();
    this.painelAberto.set(aberto);
    document.body.classList.toggle('com-painel', aberto);

    if (aberto && !antes) {
      this.gatilho = document.activeElement as HTMLElement | null;
      setTimeout(() => this.drawer()?.nativeElement.focus(), 60);
    } else if (!aberto && antes) {
      this.gatilho?.focus?.();
      this.gatilho = null;
    }
  }

  private tratarErro(e: { status?: number; error?: { message?: string } }, padrao: string) {
    if (e.status === 401 || e.status === 403) this.router.navigateByUrl('/login');
    this.erro.set(e.error?.message ?? padrao);
    this.carregando.set(false);
    return EMPTY;
  }
}
