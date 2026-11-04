import { Component, ElementRef, Injector, OnInit, afterNextRender, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, merge, of, switchMap } from 'rxjs';
import { ContratoService } from '../../core/contrato.service';
import { Contrato, ContratoDados } from '../../core/models';
import { MODALIDADES } from '../../shared/constantes';
import { addMeses, cnpjValido, mascaraCnpj, valorPorExtenso } from '../../shared/utils';

type NomeGrupo = 'identificacao' | 'empresa' | 'valores';

function cnpjValidator(c: AbstractControl): ValidationErrors | null {
  const v = c.value as string;
  return !v || cnpjValido(v) ? null : { cnpjInvalido: true };
}

function datasValidator(g: AbstractControl): ValidationErrors | null {
  const assinatura = g.get('dataAssinatura')?.value as string;
  const fim = g.get('dataFim')?.value as string;
  return assinatura && fim && fim < assinatura ? { datasInvertidas: true } : null;
}

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  host: { '(document:keydown.escape)': 'fechar()' },
  template: `
<form class="painel" [formGroup]="form" (ngSubmit)="aoEnviar()" novalidate>
  <header class="painel-topo">
    <div>
      <p class="painel-sup">{{ id ? 'Editar contrato' : 'Novo contrato' }}</p>
      <h2 class="painel-titulo">{{ etapas[etapa()] }}</h2>
    </div>
    <button type="button" class="icon-btn" (click)="fechar()" aria-label="Fechar painel">✕</button>
  </header>

  <ol class="stepper" aria-label="Etapas do cadastro">
    @for (nome of etapas; track nome; let i = $index) {
      <li [class.atual]="i === etapa()" [class.feita]="i < etapa()" [attr.aria-current]="i === etapa() ? 'step' : null">
        <button type="button" [disabled]="i >= etapa()" (click)="voltarPara(i)">
          <span class="passo-num">{{ i < etapa() ? '✓' : i + 1 }}</span>
          <span class="passo-nome">{{ nome }}</span>
        </button>
      </li>
    }
  </ol>

  <div class="painel-corpo">
    @if (carregando()) {
      <p class="muted">Carregando contrato…</p>
    } @else {
      @switch (etapa()) {
        @case (0) {
          <div class="grade" formGroupName="identificacao">
            <div class="campo inteiro">
              <label for="f-numero">Número do contrato *</label>
              <input id="f-numero" formControlName="numero" maxlength="30" autocomplete="off" placeholder="Ex.: 045/2025"
                     [attr.aria-invalid]="invalido('identificacao','numero') || null">
              @if (verificandoNumero()) { <small class="dica">Verificando se o número já existe…</small> }
              @if (mensagem('identificacao','numero'); as m) { <small class="erro-campo" role="alert">{{ m }}</small> }
            </div>
            <div class="campo inteiro">
              <label for="f-processo">Processo licitatório *</label>
              <input id="f-processo" formControlName="processoLicitatorio" maxlength="30" autocomplete="off" placeholder="Ex.: 012/2025"
                     [attr.aria-invalid]="invalido('identificacao','processoLicitatorio') || null">
              @if (mensagem('identificacao','processoLicitatorio'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo">
              <label for="f-modalidade">Modalidade *</label>
              <select id="f-modalidade" formControlName="modalidade" [attr.aria-invalid]="invalido('identificacao','modalidade') || null">
                <option value="">Selecione</option>
                @for (m of modalidades; track m) { <option [value]="m">{{ m }}</option> }
              </select>
              @if (mensagem('identificacao','modalidade'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo">
              <label for="f-nmod">Número da modalidade</label>
              <input id="f-nmod" formControlName="numeroModalidade" maxlength="30" autocomplete="off"
                     [attr.aria-invalid]="invalido('identificacao','numeroModalidade') || null">
              @if (mensagem('identificacao','numeroModalidade'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
          </div>
        }

        @case (1) {
          <div class="grade" formGroupName="empresa">
            <div class="campo inteiro">
              <label for="f-empresa">Empresa *</label>
              <input id="f-empresa" formControlName="empresa" maxlength="200" autocomplete="off"
                     [attr.aria-invalid]="invalido('empresa','empresa') || null">
              @if (mensagem('empresa','empresa'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo inteiro">
              <label for="f-cnpj">CNPJ *</label>
              <input id="f-cnpj" formControlName="cnpj" inputmode="numeric" maxlength="18" autocomplete="off" placeholder="00.000.000/0000-00"
                     (input)="mascararCnpj($any($event.target).value)" [attr.aria-invalid]="invalido('empresa','cnpj') || null">
              @if (mensagem('empresa','cnpj'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo inteiro">
              <label for="f-resumo">Resumo do objeto *</label>
              <input id="f-resumo" formControlName="resumoObjeto" maxlength="200" autocomplete="off" placeholder="Em uma linha, do que se trata"
                     [attr.aria-invalid]="invalido('empresa','resumoObjeto') || null">
              @if (mensagem('empresa','resumoObjeto'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo inteiro">
              <label for="f-objeto">Objeto *</label>
              <textarea id="f-objeto" formControlName="objeto" rows="5" maxlength="5000"
                        [attr.aria-invalid]="invalido('empresa','objeto') || null"></textarea>
              @if (mensagem('empresa','objeto'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo">
              <label for="f-orgao">Órgão gestor *</label>
              <input id="f-orgao" formControlName="orgaoGestor" maxlength="150" autocomplete="off"
                     [attr.aria-invalid]="invalido('empresa','orgaoGestor') || null">
              @if (mensagem('empresa','orgaoGestor'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo">
              <label for="f-secretario">Secretário</label>
              <input id="f-secretario" formControlName="secretario" maxlength="150" autocomplete="off"
                     [attr.aria-invalid]="invalido('empresa','secretario') || null">
              @if (mensagem('empresa','secretario'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
          </div>
        }

        @case (2) {
          <div class="grade" formGroupName="valores">
            <div class="campo inteiro">
              <label for="f-vtotal">Valor total do contrato (R$) *</label>
              <input id="f-vtotal" type="number" step="0.01" min="0" inputmode="decimal" formControlName="valorTotal"
                     [attr.aria-invalid]="invalido('valores','valorTotal') || null">
              @if (extenso()) { <small class="dica extenso">{{ valorTotal() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} — {{ extenso() }}</small> }
              @if (mensagem('valores','valorTotal'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo inteiro">
              <label for="f-vest">Valor estimado (R$)</label>
              <input id="f-vest" type="number" step="0.01" min="0" inputmode="decimal" formControlName="valorEstimado"
                     [attr.aria-invalid]="invalido('valores','valorEstimado') || null">
              @if (mensagem('valores','valorEstimado'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo">
              <label for="f-assinatura">Data de assinatura *</label>
              <input id="f-assinatura" type="date" formControlName="dataAssinatura" [attr.aria-invalid]="invalido('valores','dataAssinatura') || null">
              @if (mensagem('valores','dataAssinatura'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo">
              <label for="f-prazo">Prazo de vigência (meses)</label>
              <input id="f-prazo" type="number" min="1" max="600" inputmode="numeric" formControlName="prazoVigenciaMeses"
                     [attr.aria-invalid]="invalido('valores','prazoVigenciaMeses') || null">
              @if (mensagem('valores','prazoVigenciaMeses'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
            <div class="campo inteiro">
              <label for="f-fim">Fim da vigência *</label>
              <input id="f-fim" type="date" formControlName="dataFim" (input)="dataFimManual.set(true)"
                     [attr.aria-invalid]="invalido('valores','dataFim') || null">
              @if (!dataFimManual() && prazoMeses()) {
                <small class="dica">Calculada automaticamente: assinatura + {{ prazoMeses() }} {{ prazoMeses() === 1 ? 'mês' : 'meses' }}. Você pode ajustar.</small>
              } @else if (dataFimManual() && prazoMeses() && assinatura()) {
                <small class="dica">Data ajustada manualmente.
                  <button type="button" class="btn link" (click)="recalcularDataFim(true)">Recalcular a partir do prazo</button></small>
              }
              @if (mensagem('valores','dataFim'); as m) { <small class="erro-campo">{{ m }}</small> }
            </div>
          </div>
        }

        @case (3) {
          @let d = payload();
          <p class="muted etapa-titulo">Confira os dados antes de {{ id ? 'salvar as alterações' : 'cadastrar o contrato' }}.</p>
          <section class="secao">
            <h3>Identificação</h3>
            <dl class="dl">
              <dt>Número</dt><dd>{{ d.numero }}</dd>
              <dt>Processo</dt><dd>{{ d.processoLicitatorio }}</dd>
              <dt>Modalidade</dt><dd>{{ d.modalidade }}{{ d.numeroModalidade ? ' nº ' + d.numeroModalidade : '' }}</dd>
            </dl>
          </section>
          <section class="secao">
            <h3>Empresa e objeto</h3>
            <dl class="dl">
              <dt>Empresa</dt><dd>{{ d.empresa }}</dd>
              <dt>CNPJ</dt><dd>{{ d.cnpj }}</dd>
              <dt>Órgão gestor</dt><dd>{{ d.orgaoGestor }}</dd>
              <dt>Secretário</dt><dd>{{ d.secretario || '—' }}</dd>
              <dt>Resumo</dt><dd>{{ d.resumoObjeto }}</dd>
              <dt>Descrição</dt><dd class="texto">{{ d.objeto }}</dd>
            </dl>
          </section>
          <section class="secao">
            <h3>Valores e vigência</h3>
            <dl class="dl">
              <dt>Valor total</dt><dd>{{ d.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}<br><small class="muted">{{ extenso() }}</small></dd>
              <dt>Valor estimado</dt><dd>{{ d.valorEstimado != null ? (d.valorEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR') : '—' }}</dd>
              <dt>Assinatura</dt><dd>{{ d.dataAssinatura | date:'dd/MM/yyyy' }}</dd>
              <dt>Fim da vigência</dt><dd>{{ d.dataFim | date:'dd/MM/yyyy' }}</dd>
              <dt>Prazo</dt><dd>{{ d.prazoVigenciaMeses ? d.prazoVigenciaMeses + ' meses' : '—' }}</dd>
            </dl>
          </section>
        }
      }
      @if (erro()) { <div class="alert error" role="alert">{{ erro() }}</div> }
    }
  </div>

  <footer class="painel-rodape">
    <button type="button" class="btn secundario" (click)="etapa() === 0 ? fechar() : voltar()">{{ etapa() === 0 ? 'Cancelar' : 'Voltar' }}</button>
    @if (etapa() < 3) {
      <button type="submit" class="btn" [disabled]="carregando()">Continuar</button>
    } @else {
      <button type="submit" class="btn sucesso" [disabled]="salvando()">{{ salvando() ? 'Salvando…' : (id ? 'Salvar alterações' : 'Cadastrar contrato') }}</button>
    }
  </footer>
</form>`
})
export class ContratoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ContratoService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly modalidades = MODALIDADES;
  readonly etapas = ['Identificação', 'Empresa e objeto', 'Valores e vigência', 'Revisão'];

  id?: number;
  readonly etapa = signal(0);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly numeroDuplicado = signal(false);
  readonly verificandoNumero = signal(false);
  readonly dataFimManual = signal(false);

  readonly form = this.fb.group({
    identificacao: this.fb.nonNullable.group({
      numero: ['', [Validators.required, Validators.maxLength(30)]],
      processoLicitatorio: ['', [Validators.required, Validators.maxLength(30)]],
      modalidade: ['', Validators.required],
      numeroModalidade: ['', Validators.maxLength(30)]
    }),
    empresa: this.fb.nonNullable.group({
      empresa: ['', [Validators.required, Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, cnpjValidator]],
      orgaoGestor: ['', [Validators.required, Validators.maxLength(150)]],
      secretario: ['', Validators.maxLength(150)],
      resumoObjeto: ['', [Validators.required, Validators.maxLength(200)]],
      objeto: ['', [Validators.required, Validators.maxLength(5000)]]
    }),
    valores: this.fb.group({
      valorTotal: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      valorEstimado: this.fb.control<number | null>(null, Validators.min(0)),
      dataAssinatura: this.fb.nonNullable.control('', Validators.required),
      prazoVigenciaMeses: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(600)]),
      dataFim: this.fb.nonNullable.control('', Validators.required)
    }, { validators: datasValidator })
  });

  // Valores do formulário expostos como signals para a tela reagir enquanto o usuário digita
  readonly valorTotal = toSignal(this.form.controls.valores.controls.valorTotal.valueChanges, { initialValue: null });
  readonly prazoMeses = toSignal(this.form.controls.valores.controls.prazoVigenciaMeses.valueChanges, { initialValue: null });
  readonly assinatura = toSignal(this.form.controls.valores.controls.dataAssinatura.valueChanges, { initialValue: '' });
  readonly extenso = computed(() => valorPorExtenso(this.valorTotal()));

  private readonly numero$ = new Subject<string>();

  constructor() {
    // Número duplicado: consulta o backend enquanto o usuário digita (a validação definitiva continua no servidor)
    this.numero$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(n => {
        if (!n.trim()) { this.numeroDuplicado.set(false); return EMPTY; }
        this.verificandoNumero.set(true);
        return this.service.numeroEmUso(n.trim(), this.id).pipe(catchError(() => of(false)));
      }),
      takeUntilDestroyed()
    ).subscribe(emUso => { this.numeroDuplicado.set(emUso); this.verificandoNumero.set(false); });

    this.form.controls.identificacao.controls.numero.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(v => { this.numeroDuplicado.set(false); this.numero$.next(v); });

    // Fim da vigência = assinatura + prazo, enquanto o usuário não ajustar a data manualmente
    merge(
      this.form.controls.valores.controls.dataAssinatura.valueChanges,
      this.form.controls.valores.controls.prazoVigenciaMeses.valueChanges
    ).pipe(takeUntilDestroyed()).subscribe(() => this.recalcularDataFim(false));
  }

  ngOnInit() {
    const v = this.route.snapshot.paramMap.get('id');
    if (!v) return;
    this.id = Number(v);
    this.carregando.set(true);
    this.service.buscar(this.id).subscribe({
      next: c => { this.preencher(c); this.carregando.set(false); },
      error: e => {
        this.carregando.set(false);
        this.erro.set(e.status === 404 ? 'Contrato não encontrado.' : e.error?.message ?? 'Não foi possível carregar o contrato.');
      }
    });
  }

  private preencher(c: Contrato) {
    this.dataFimManual.set(true); // na edição, nunca sobrescreve a data de fim já cadastrada
    this.form.patchValue({
      identificacao: {
        numero: c.numero, processoLicitatorio: c.processoLicitatorio, modalidade: c.modalidade,
        numeroModalidade: c.numeroModalidade ?? ''
      },
      empresa: {
        empresa: c.empresa, cnpj: c.cnpj, orgaoGestor: c.orgaoGestor, secretario: c.secretario ?? '',
        resumoObjeto: c.resumoObjeto, objeto: c.objeto
      },
      valores: {
        valorTotal: c.valorTotal, valorEstimado: c.valorEstimado ?? null, dataAssinatura: c.dataAssinatura,
        prazoVigenciaMeses: c.prazoVigenciaMeses ?? null, dataFim: c.dataFim
      }
    });
    this.form.markAsPristine();
  }

  /* ---------- campos ---------- */
  mascararCnpj(valor: string) {
    this.form.controls.empresa.controls.cnpj.setValue(mascaraCnpj(valor));
  }

  recalcularDataFim(forcar: boolean) {
    const { dataAssinatura, prazoVigenciaMeses } = this.form.controls.valores.getRawValue();
    if (!dataAssinatura || !prazoVigenciaMeses || prazoVigenciaMeses < 1) return;
    if (this.dataFimManual() && !forcar) return;
    this.form.controls.valores.controls.dataFim.setValue(addMeses(dataAssinatura, prazoVigenciaMeses));
    this.dataFimManual.set(false);
  }

  mensagem(grupo: NomeGrupo, nome: string): string | null {
    const g = this.form.get(grupo) as FormGroup;
    const c = g.get(nome);
    if (!c) return null;
    if (grupo === 'identificacao' && nome === 'numero' && this.numeroDuplicado()) return 'Já existe um contrato com esse número.';
    if (!c.touched) return null;
    if (grupo === 'valores' && nome === 'dataFim' && g.hasError('datasInvertidas')) return 'A data de fim não pode ser anterior à assinatura.';
    const e = c.errors;
    if (!e) return null;
    if (e['required']) return 'Campo obrigatório.';
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    if (e['min']) return `O valor mínimo é ${e['min'].min}.`;
    if (e['max']) return `O valor máximo é ${e['max'].max}.`;
    if (e['cnpjInvalido']) return 'CNPJ inválido. Confira os dígitos.';
    return 'Valor inválido.';
  }

  invalido(grupo: NomeGrupo, nome: string): boolean { return !!this.mensagem(grupo, nome); }

  payload(): ContratoDados {
    const f = this.form.getRawValue();
    return { ...f.identificacao, ...f.empresa, ...f.valores };
  }

  /* ---------- navegação entre etapas ---------- */
  private grupo(i: number): FormGroup | null {
    return i === 0 ? this.form.controls.identificacao : i === 1 ? this.form.controls.empresa : i === 2 ? this.form.controls.valores : null;
  }

  aoEnviar() { if (this.etapa() < 3) this.avancar(); else this.salvar(); }

  avancar() {
    const g = this.grupo(this.etapa());
    if (g) {
      g.markAllAsTouched();
      if (g.invalid || (this.etapa() === 0 && this.numeroDuplicado())) { this.focarPrimeiroInvalido(); return; }
    }
    this.etapa.update(e => e + 1);
    this.aposTrocarEtapa();
  }

  voltar() { this.etapa.update(e => Math.max(0, e - 1)); this.erro.set(''); this.aposTrocarEtapa(); }
  voltarPara(i: number) { if (i < this.etapa()) { this.etapa.set(i); this.erro.set(''); this.aposTrocarEtapa(); } }

  private focarPrimeiroInvalido() {
    afterNextRender(() => this.el.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
  }

  private aposTrocarEtapa() {
    afterNextRender(() => {
      const corpo = this.el.nativeElement.querySelector<HTMLElement>('.painel-corpo');
      corpo?.scrollTo?.(0, 0);
      corpo?.querySelector<HTMLElement>('input, select, textarea')?.focus();
    }, { injector: this.injector });
  }

  /* ---------- salvar e fechar ---------- */
  salvar() {
    for (let i = 0; i < 3; i++) {
      const g = this.grupo(i)!;
      if (g.invalid) { g.markAllAsTouched(); this.etapa.set(i); this.focarPrimeiroInvalido(); return; }
    }
    if (this.numeroDuplicado()) { this.etapa.set(0); this.focarPrimeiroInvalido(); return; }

    this.salvando.set(true);
    this.erro.set('');
    const dados = this.payload();
    const req = this.id ? this.service.atualizar(this.id, dados) : this.service.criar(dados);
    req.subscribe({
      next: c => this.router.navigate(['/contratos', c.id]),
      error: e => {
        this.salvando.set(false);
        if (e.status === 409) {
          this.numeroDuplicado.set(true);
          this.etapa.set(0);
          this.focarPrimeiroInvalido();
        } else if (e.status === 403) {
          this.erro.set('Você não tem permissão para cadastrar ou editar contratos.');
        } else if (e.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set(e.error?.message ?? 'Não foi possível salvar o contrato.');
        }
      }
    });
  }

  fechar() {
    if (this.form.dirty && !confirm('Descartar as alterações não salvas?')) return;
    this.router.navigate(this.id ? ['/contratos', this.id] : ['/contratos']);
  }
}
