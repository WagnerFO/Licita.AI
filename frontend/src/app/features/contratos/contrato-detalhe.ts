import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, map, switchMap, tap } from 'rxjs';
import { ContratoService } from '../../core/contrato.service';
import { AuthService } from '../../core/auth.service';
import { Contrato, HistoricoItem } from '../../core/models';
import { classeSituacao, rotuloSituacao, textoPrazo } from '../../shared/utils';

const ROTULOS: Record<string, string> = {
  numero: 'Número', processoLicitatorio: 'Processo licitatório', numeroModalidade: 'Nº da modalidade',
  modalidade: 'Modalidade', empresa: 'Empresa', cnpj: 'CNPJ', resumoObjeto: 'Resumo do objeto', objeto: 'Objeto',
  valorEstimado: 'Valor estimado', valorTotal: 'Valor total', orgaoGestor: 'Órgão gestor', secretario: 'Secretário',
  dataAssinatura: 'Data de assinatura', dataFim: 'Fim da vigência', prazoVigenciaMeses: 'Prazo (meses)'
};
const CAMPOS_DATA = ['dataAssinatura', 'dataFim'];
const CAMPOS_VALOR = ['valorEstimado', 'valorTotal'];

@Component({
  selector: 'app-contrato-detalhe',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  host: { '(document:keydown.escape)': 'fechar()' },
  template: `
<div class="painel">
  <header class="painel-topo">
    <div>
      <p class="painel-sup">Contrato</p>
      <h2 class="painel-titulo">{{ contrato()?.numero ?? '…' }}</h2>
    </div>
    <button type="button" class="icon-btn" (click)="fechar()" aria-label="Fechar painel">✕</button>
  </header>

  @if (contrato(); as c) {
    <div class="painel-corpo">
      <div [class]="'prazo ' + classe(c.situacao)">
        <span [class]="'chip ' + classe(c.situacao)">{{ rotulo(c.situacao) }}</span>
        <strong>{{ prazo(c.diasParaVencimento) }}</strong>
        <span class="muted">Fim da vigência em {{ c.dataFim | date:'dd/MM/yyyy' }}</span>
      </div>

      <div class="abas" role="tablist" aria-label="Seções do contrato">
        <button type="button" role="tab" [class.ativa]="aba() === 'dados'" [attr.aria-selected]="aba() === 'dados'" (click)="aba.set('dados')">Dados</button>
        <button type="button" role="tab" [class.ativa]="aba() === 'historico'" [attr.aria-selected]="aba() === 'historico'" (click)="abrirHistorico()">Histórico</button>
      </div>

      @if (aba() === 'dados') {
        <section class="secao" role="tabpanel">
          <h3>Empresa</h3>
          <dl class="dl">
            <dt>Empresa</dt><dd>{{ c.empresa }}</dd>
            <dt>CNPJ</dt><dd>{{ c.cnpj }}</dd>
          </dl>
        </section>
        <section class="secao">
          <h3>Processo</h3>
          <dl class="dl">
            <dt>Processo licitatório</dt><dd>{{ c.processoLicitatorio }}</dd>
            <dt>Modalidade</dt><dd>{{ c.modalidade }}{{ c.numeroModalidade ? ' nº ' + c.numeroModalidade : '' }}</dd>
          </dl>
        </section>
        <section class="secao">
          <h3>Gestão</h3>
          <dl class="dl">
            <dt>Órgão gestor</dt><dd>{{ c.orgaoGestor }}</dd>
            <dt>Secretário</dt><dd>{{ c.secretario || '—' }}</dd>
          </dl>
        </section>
        <section class="secao">
          <h3>Valores</h3>
          <dl class="dl">
            <dt>Valor total</dt><dd>{{ c.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</dd>
            <dt>Valor estimado</dt><dd>{{ c.valorEstimado != null ? (c.valorEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR') : '—' }}</dd>
          </dl>
        </section>
        <section class="secao">
          <h3>Vigência</h3>
          <dl class="dl">
            <dt>Assinatura</dt><dd>{{ c.dataAssinatura | date:'dd/MM/yyyy' }}</dd>
            <dt>Fim da vigência</dt><dd>{{ c.dataFim | date:'dd/MM/yyyy' }}</dd>
            <dt>Prazo</dt><dd>{{ c.prazoVigenciaMeses ? c.prazoVigenciaMeses + ' meses' : '—' }}</dd>
          </dl>
        </section>
        <section class="secao">
          <h3>Objeto</h3>
          <dl class="dl">
            <dt>Resumo</dt><dd>{{ c.resumoObjeto }}</dd>
            <dt>Descrição</dt><dd class="texto">{{ c.objeto }}</dd>
          </dl>
        </section>
      } @else {
        <section role="tabpanel">
          @if (historicoErro()) {
            <p class="muted">{{ historicoErro() }}</p>
          } @else {
            @if (grupos(); as gs) {
              @if (gs.length === 0) {
                <p class="muted">Nenhuma alteração registrada para este contrato.</p>
              } @else {
                <ol class="linha-tempo">
                  @for (g of gs; track g.eventoId) {
                    <li>
                      <p><strong>{{ g.acao === 'CRIACAO' ? 'Contrato cadastrado' : 'Contrato alterado' }}</strong></p>
                      <p class="lt-meta">{{ g.usuario }} · {{ g.dataHora | date:'dd/MM/yyyy HH:mm' }}</p>
                      @if (g.mudancas.length) {
                        <ul>
                          @for (m of g.mudancas; track m.campo) {
                            <li><span class="lt-campo">{{ rotuloCampo(m.campo!) }}:</span>
                              <del>{{ formatar(m.campo!, m.valorAnterior) }}</del> → <ins>{{ formatar(m.campo!, m.valorNovo) }}</ins></li>
                          }
                        </ul>
                      }
                    </li>
                  }
                </ol>
              }
            } @else {
              <p class="muted">Carregando histórico…</p>
            }
          }
        </section>
      }
    </div>
    @if (auth.usuario()?.perfil === 'ADMIN') {
      <footer class="painel-rodape">
        <button type="button" class="btn secundario" (click)="fechar()">Fechar</button>
        <a class="btn" [routerLink]="['/contratos', c.id, 'editar']">Editar contrato</a>
      </footer>
    }
  } @else if (erro()) {
    <div class="painel-corpo"><div class="alert error" role="alert">{{ erro() }}</div></div>
  } @else {
    <div class="painel-corpo"><p class="muted">Carregando contrato…</p></div>
  }
</div>`
})
export class ContratoDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ContratoService);
  readonly auth = inject(AuthService);

  readonly contrato = signal<Contrato | null>(null);
  readonly erro = signal('');
  readonly aba = signal<'dados' | 'historico'>('dados');
  readonly historico = signal<HistoricoItem[] | null>(null);
  readonly historicoErro = signal('');

  /** Agrupa as linhas de auditoria que pertencem à mesma edição (mesmo eventoId). */
  readonly grupos = computed(() => {
    const itens = this.historico();
    if (!itens) return null;
    const mapa = new Map<string, HistoricoItem[]>();
    for (const i of itens) mapa.set(i.eventoId, [...(mapa.get(i.eventoId) ?? []), i]);
    return [...mapa.values()].map(l => ({
      eventoId: l[0].eventoId, acao: l[0].acao, usuario: l[0].usuarioEmail, dataHora: l[0].dataHora,
      mudancas: l.filter(x => !!x.campo)
    }));
  });

  rotulo = rotuloSituacao;
  classe = classeSituacao;
  prazo = textoPrazo;

  constructor() {
    this.route.paramMap.pipe(
      map(p => Number(p.get('id'))),
      tap(() => {
        this.contrato.set(null); this.erro.set(''); this.aba.set('dados');
        this.historico.set(null); this.historicoErro.set('');
      }),
      switchMap(id => this.service.buscar(id).pipe(catchError(e => {
        this.erro.set(e.status === 404 ? 'Contrato não encontrado.' : e.error?.message ?? 'Não foi possível carregar o contrato.');
        return EMPTY;
      }))),
      takeUntilDestroyed()
    ).subscribe(c => this.contrato.set(c));
  }

  fechar() { this.router.navigate(['/contratos']); }

  abrirHistorico() {
    this.aba.set('historico');
    const c = this.contrato();
    if (!c || this.historico() !== null) return;
    this.service.historico(c.id).subscribe({
      next: h => this.historico.set(h),
      error: e => this.historicoErro.set(e.status === 404
        ? 'O histórico de alterações ainda não está disponível nesta versão do sistema.'
        : 'Não foi possível carregar o histórico.')
    });
  }

  rotuloCampo(campo: string) { return ROTULOS[campo] ?? campo; }

  formatar(campo: string, valor: string | null): string {
    if (valor === null || valor === '') return '(vazio)';
    if (CAMPOS_DATA.includes(campo)) { const [a, m, d] = valor.split('-'); return `${d}/${m}/${a}`; }
    if (CAMPOS_VALOR.includes(campo)) return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return valor.length > 140 ? valor.slice(0, 140) + '…' : valor;
  }
}
