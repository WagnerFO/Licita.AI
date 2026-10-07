# Licita.AI — Incremento 1 (Login + Contratos)

Gerenciador de contratos e processos licitatórios da Prefeitura de Vitória de Santo Antão.

## Histórias do Product Backlog entregues
| ID | História | Situação |
|----|----------|----------|
| 1 | Login e autenticação | Pronta |
| 2 | Cadastrar contrato | Pronta |
| 3 | Consultar contratos | Pronta |
| 4 | Editar contrato | Pronta |
| 8 | Pesquisar registros | Parcial (somente contratos; processos ficam para a próxima sprint) |
| 9 | Aplicar filtros | Parcial (modalidade e situação) |

## Como executar
```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

export SECRET_KEY="troque-por-um-texto-longo-e-aleatorio"   # Windows: set SECRET_KEY=...
flask --app licitaai init-db
flask --app licitaai criar-usuario --perfil admin           # pede nome, e-mail e senha (mín. 10 caracteres)
flask --app licitaai importar-planilha caminho/da/planilha.xlsm   # opcional: carrega dados de teste
flask --app licitaai run
```
Acesse http://127.0.0.1:5000

Em produção use HTTPS e defina `COOKIE_SECURE=1`.

## Testes
```bash
python -m pytest -v
```

## Perfis
- **admin**: consulta, cadastra e edita contratos.
- **consulta**: apenas consulta.

## Medidas de segurança aplicadas
- Senhas guardadas com hash (werkzeug/scrypt); nenhuma senha no código.
- Bloqueio de 15 min após 5 tentativas erradas; mensagem de erro genérica (não revela se o e-mail existe).
- Sessão nova a cada login, cookie HttpOnly + SameSite=Lax, expiração em 30 min.
- Token CSRF em todos os formulários POST; logout somente via POST.
- Consultas SQL parametrizadas (proteção contra SQL Injection); curingas do LIKE escapados.
- Jinja2 com escape automático (proteção contra XSS) e CSP sem scripts/estilos inline.
- Validação no servidor: campos obrigatórios, tamanhos, CNPJ (dígitos verificadores), valores, datas e lista fechada de modalidades.
- Controle de acesso por perfil (403 para quem não tem permissão).
- Páginas sem cache (`no-store`) e erros 500 sem detalhes técnicos.

## Definition of Done — checklist
- [x] Código implementado e funcionando
- [x] Testes automatizados passando (32)
- [x] Validações de entrada
- [x] Requisitos de segurança (RNF01, RNF02, RNF08)
- [x] Demonstração possível conforme coluna "Como demonstrar" do backlog
- [x] Documentação (este README)

## Estrutura
```
licitaai/
  __init__.py     criação do app e filtros de formatação
  auth.py         login, logout, bloqueio, decorators de acesso
  contratos.py    listar, detalhar, cadastrar e editar
  validacoes.py   validação do formulário, CNPJ e valores
  seguranca.py    CSRF e cabeçalhos de segurança
  db.py / schema.sql
  importar.py     importação da planilha
  templates/ static/
tests/
```
