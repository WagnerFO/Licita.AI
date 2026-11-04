import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../../app.routes';
import { ContratosListaComponent } from './contratos-lista';
import { Contrato } from '../../core/models';

registerLocaleData(localePt);

const contrato: Contrato = {
  id: 7, numero: '045/2025', processoLicitatorio: '012/2025', numeroModalidade: '03', modalidade: 'Pregão Eletrônico',
  empresa: 'Empresa Exemplo LTDA', cnpj: '11.222.333/0001-81', resumoObjeto: 'Manutenção de veículos', objeto: 'Objeto completo',
  valorEstimado: null, valorTotal: 15300.5, orgaoGestor: 'Secretaria de Obras', secretario: null,
  dataAssinatura: '2025-03-10', dataFim: '2026-03-10', prazoVigenciaMeses: 12, situacao: 'NO_PRAZO', diasParaVencimento: 120
};
const pagina = (c: Contrato[]) => ({ content: c, totalElements: c.length, totalPages: 1, number: 0, size: 15 });

describe('Contratos: lista + painel lateral', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(), provideRouter(routes), provideHttpClient(), provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  /** Responde todas as chamadas HTTP pendentes, repetindo até não sobrar nenhuma. */
  async function responder(extra?: (url: string) => unknown | undefined) {
    for (let i = 0; i < 5; i++) {
      await harness.fixture.whenStable();
      const abertas = http.match(() => true);
      if (!abertas.length) break;
      for (const r of abertas) {
        const url = r.request.urlWithParams;
        const custom = extra?.(url);
        if (custom !== undefined) r.flush(custom);
        else if (url.endsWith('/auth/me')) r.flush({ id: 1, nome: 'Ana', email: 'ana@x.com', perfil: 'ADMIN' });
        else if (/\/contratos\/7$/.test(url)) r.flush(contrato);
        else if (/\/contratos\?/.test(url)) r.flush(pagina([contrato]));
        else r.flush(null);
      }
    }
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
  }
  const dom = () => harness.routeNativeElement as HTMLElement;
  const digitar = (sel: string, valor: string) => {
    const el = dom().querySelector<HTMLInputElement>(sel)!;
    el.value = valor; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('blur'));
  };
  const clicar = (texto: string) => {
    const b = Array.from(dom().querySelectorAll<HTMLButtonElement>('button')).find(x => x.textContent?.includes(texto))!;
    b.click();
  };

  it('mostra a lista com o painel fechado', async () => {
    await harness.navigateByUrl('/contratos', ContratosListaComponent);
    await responder();
    expect(dom().textContent).toContain('045/2025');
    expect(dom().querySelector('.drawer.aberto')).toBeNull();
  });

  it('clicar na linha abre o painel lateral com os dados e destaca a linha', async () => {
    await harness.navigateByUrl('/contratos', ContratosListaComponent);
    await responder();
    dom().querySelector<HTMLElement>('tbody tr')!.click();
    await responder();
    const painel = dom().querySelector('.drawer.aberto')!;
    expect(painel).not.toBeNull();
    expect(painel.textContent).toContain('Empresa Exemplo LTDA');
    expect(painel.textContent).toContain('Vence em 120 dias');
    expect(dom().querySelector('tbody tr.selecionada')).not.toBeNull();
  });

  it('abrir /contratos/7 direto pela URL mostra o painel; fechar volta para a lista sem recarregar', async () => {
    await harness.navigateByUrl('/contratos/7', ContratosListaComponent);
    await responder();
    expect(dom().querySelector('.drawer.aberto')?.textContent).toContain('045/2025');
    dom().querySelector<HTMLElement>('.icon-btn')!.click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    expect(dom().querySelector('.drawer.aberto')).toBeNull();
    expect(http.match(() => true)).toHaveLength(0); // fechar o painel não recarrega a lista
  });

  it('cards de resumo usam as contagens por situação', async () => {
    await harness.navigateByUrl('/contratos', ContratosListaComponent);
    await responder(url => url.includes('situacao=a_vencer') ? { ...pagina([]), totalElements: 5 }
      : url.includes('situacao=vencido') ? { ...pagina([]), totalElements: 2 }
      : url.includes('situacao=no_prazo') ? { ...pagina([]), totalElements: 10 } : undefined);
    const cards = Array.from(dom().querySelectorAll('.resumo-card strong')).map(e => e.textContent?.trim());
    expect(cards).toEqual(['17', '10', '5', '2']);
  });

  it('cadastro: não avança com campos obrigatórios vazios e mostra os erros', async () => {
    await harness.navigateByUrl('/contratos/novo', ContratosListaComponent);
    await responder();
    expect(dom().querySelector('.drawer.aberto')).not.toBeNull();
    clicar('Continuar');
    await responder();
    expect(dom().querySelector('.painel-titulo')?.textContent).toContain('Identificação');
    expect(dom().textContent).toContain('Campo obrigatório.');
  });

  it('cadastro: avança etapa a etapa, calcula a data de fim e mostra o valor por extenso', async () => {
    await harness.navigateByUrl('/contratos/novo', ContratosListaComponent);
    await responder();

    // etapa 1
    digitar('#f-numero', '045/2025');
    digitar('#f-processo', '012/2025');
    const sel = dom().querySelector<HTMLSelectElement>('#f-modalidade')!;
    sel.value = 'Pregão Eletrônico'; sel.dispatchEvent(new Event('change')); sel.dispatchEvent(new Event('blur'));
    clicar('Continuar'); await responder();
    expect(dom().querySelector('.painel-titulo')?.textContent).toContain('Empresa e objeto');

    // etapa 2: CNPJ com máscara automática
    digitar('#f-empresa', 'Empresa Exemplo LTDA');
    digitar('#f-cnpj', '11222333000181');
    expect((dom().querySelector('#f-cnpj') as HTMLInputElement).value).toBe('11.222.333/0001-81');
    digitar('#f-resumo', 'Manutenção de veículos');
    digitar('#f-objeto', 'Descrição completa do objeto');
    digitar('#f-orgao', 'Secretaria de Obras');
    clicar('Continuar'); await responder();
    expect(dom().querySelector('.painel-titulo')?.textContent).toContain('Valores e vigência');

    // etapa 3: extenso e data de fim calculada
    digitar('#f-vtotal', '15300.5');
    digitar('#f-assinatura', '2025-03-10');
    digitar('#f-prazo', '12');
    await responder();
    expect((dom().querySelector('#f-fim') as HTMLInputElement).value).toBe('2026-03-10');
    expect(dom().textContent).toContain('quinze mil e trezentos reais e cinquenta centavos');
    clicar('Continuar'); await responder();

    // revisão
    expect(dom().querySelector('.painel-titulo')?.textContent).toContain('Revisão');
    expect(dom().querySelector('.painel-corpo')?.textContent).toContain('Empresa Exemplo LTDA');
    expect(dom().textContent).toContain('Cadastrar contrato');
  });

  it('cadastro: avisa enquanto digita que o número já existe e bloqueia o avanço', async () => {
    await harness.navigateByUrl('/contratos/novo', ContratosListaComponent);
    await responder();
    digitar('#f-numero', '045/2025');
    await new Promise(r => setTimeout(r, 480));
    const req = http.expectOne(r => r.url.endsWith('/contratos/existe'));
    expect(req.request.params.get('numero')).toBe('045/2025');
    req.flush({ existe: true });
    await responder();
    expect(dom().textContent).toContain('Já existe um contrato com esse número.');
    digitar('#f-processo', '012/2025');
    const sel = dom().querySelector<HTMLSelectElement>('#f-modalidade')!;
    sel.value = 'Dispensa'; sel.dispatchEvent(new Event('change'));
    clicar('Continuar'); await responder();
    expect(dom().querySelector('.painel-titulo')?.textContent).toContain('Identificação');
  });

  it('edição: carrega os dados do contrato e não sobrescreve a data de fim', async () => {
    await harness.navigateByUrl('/contratos/7/editar', ContratosListaComponent);
    await responder();
    expect((dom().querySelector('#f-numero') as HTMLInputElement).value).toBe('045/2025');
    expect(dom().querySelector('.painel-sup')?.textContent).toContain('Editar contrato');
  });
});
