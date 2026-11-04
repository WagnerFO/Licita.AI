# Licita.AI — Guia de instalação, diagnóstico e suporte com IA

> **Propósito:** este arquivo pode ser enviado integralmente a uma IA para que ela ajude outra pessoa a instalar, executar, testar ou diagnosticar problemas do Licita.AI. Ele não substitui o código nem a inspeção dos erros reais. Leia primeiro o [README principal](../README.md).
>
> **Escopo:** ambiente local de desenvolvimento e demonstração. Não é guia de implantação em produção.
>
> **Base verificada:** estrutura da branch `develop` em 27/10/2026. Se o repositório tiver evoluído, consulte os arquivos atuais antes de concluir que os comandos ainda são iguais.

## 1. Contexto do projeto

O **Licita.AI** é um sistema web acadêmico B2G para centralizar e consultar informações estruturadas de contratos e processos licitatórios. O propósito inicial é facilitar o cadastro, a busca, os filtros e o acompanhamento de prazos.

**Stack oficial:**
- Frontend: Angular 22.2, TypeScript, SCSS e RxJS.
- Backend: Java 21, Spring Boot 4.1.1, Spring Security, Spring Data JPA/Hibernate, Bean Validation e Maven Wrapper.
- Banco: PostgreSQL 18 em Docker Compose.
- Evolução do schema: Flyway.
- Testes: JUnit e Mockito no backend; build Angular e GitHub Actions CI.
- API: HTTP REST/JSON, documentada com Swagger/OpenAPI.

**Atenção:** houve uma implementação intermediária antiga em Flask/SQLite, mas **ela não é a stack oficial atual**. Não oriente a instalar Python, Flask ou SQLite para executar a aplicação do repositório atual.

**Escopo funcional já existente no código consultado:**
- Login/logout por sessão, e-mail e senha, perfis ADMIN e CONSULTA.
- Cadastro, listagem, detalhe e atualização de **informações** de contratos.
- Busca, paginação, filtros por modalidade e situação.
- Validações de número duplicado, CNPJ, datas e modalidades.
- Situação de vencimento de contrato (NO_PRAZO, A_VENCER, VENCIDO), com intervalo de 60 dias.
- Swagger e endpoint de status.

**Não presumir que já existe:** CRUD completo de processos licitatórios, dashboard, IA, envio/armazenamento de PDFs de contratos, exclusão de contratos. Consulte o repositório para verificar novidades. A aplicação atual não armazena o arquivo físico/digital do contrato.

## 2. Repositório, branches e arquivos essenciais

Repositório: https://github.com/WagnerFO/Licita.AI

- `main`: base estável/oficial.
- `develop`: integração de funcionalidades; **é a branch usada nas instruções abaixo**.
- `feature/*`: desenvolvimento de funcionalidades.
- `docs/*`: documentação.

Estrutura:

~~~text
Licita.AI/
├── .github/workflows/ci.yml
├── backend/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── src/main/
│       ├── java/br/edu/unifacol/licitaai/
│       └── resources/
│           ├── application.properties
│           └── db/migration/
│               ├── V1__create_usuario.sql
│               ├── V2__seguranca_usuario.sql
│               └── V3__create_contrato.sql
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/app/
├── docs/
├── docker-compose.yml
└── README.md
~~~

As migrations `V1`, `V2` e `V3` são as publicadas nesta base. Uma migration `V4__create_processo_licitatorio.sql` foi iniciada localmente durante outro trabalho, mas **não estava publicada em `develop`** na data deste guia. Não a trate como parte da instalação padrão.

## 3. Pré-requisitos e ferramentas

Instalar:
1. Git.
2. JDK Java 21 (não apenas o JRE).
3. Node.js 22 e npm.
4. Docker Desktop com Docker Compose, iniciado e pronto para uso.
5. Opcional: IntelliJ IDEA para o backend; VS Code para o frontend.

No **CMD do Windows**, conferir:

~~~cmd
git --version
java -version
node --version
npm --version
docker --version
docker compose version
docker info
~~~

Resultados esperados: versões instaladas, Java 21, Node 22, e `docker info` sem erro de conexão com o daemon. Se o Docker não responder, abrir o Docker Desktop e verificar se está operacional.

O backend usa **Maven Wrapper**; não é obrigatório instalar Maven global.

## 4. Instalação limpa no Windows

### Passo A — Clonar a branch develop

Abra CMD ou PowerShell na pasta em que deseja clonar o projeto:

~~~cmd
git clone -b develop https://github.com/WagnerFO/Licita.AI.git
cd Licita.AI
git branch --show-current
git status
~~~

Espera-se `develop` como branch atual e diretório de trabalho limpo. A pasta exata depende de onde o clone foi feito.

### Passo B — Iniciar PostgreSQL

Na **raiz do repositório**, execute:

~~~cmd
docker compose up -d
docker compose ps
~~~

Esperado: serviço `postgres`/container `licita-postgres` em execução, com porta local 5432 publicada.

Configuração do Docker Compose para **desenvolvimento local**:
- Imagem: PostgreSQL 18.
- Banco: `licita_ai`.
- Usuário: `licita`.
- Porta: `5432`.
- A senha local de desenvolvimento está em `docker-compose.yml` e é utilizada como fallback no `backend/src/main/resources/application.properties`. Não a reutilize em produção.

O volume nomeado persiste os dados entre reinicializações normais. **Não use `docker compose down -v`, `docker volume prune` ou comandos equivalentes para tentar corrigir problemas**, pois podem apagar o banco.

### Passo C — Configurar primeiro administrador

Uma instalação nova inicia sem usuário de exemplo. O primeiro administrador é criado pelo componente `AdminBootstrap` na inicialização do backend **se** as variáveis de ambiente de e-mail e senha estiverem definidas. Escolha seus próprios dados; não há usuário/senha universal de login no GitHub.

**CMD (no mesmo terminal em que o backend será executado):**

~~~cmd
set LICITAAI_ADMIN_NOME=Administrador
set LICITAAI_ADMIN_EMAIL=seu-email@exemplo.com
set LICITAAI_ADMIN_PASSWORD=escolha-uma-senha-com-10-ou-mais-caracteres
~~~

**PowerShell (no mesmo terminal em que o backend será executado):**

~~~powershell
$env:LICITAAI_ADMIN_NOME = "Administrador"
$env:LICITAAI_ADMIN_EMAIL = "seu-email@exemplo.com"
$env:LICITAAI_ADMIN_PASSWORD = "escolha-uma-senha-com-10-ou-mais-caracteres"
~~~

Observações importantes:
- A senha deve ter pelo menos **10 caracteres**.
- A criação só ocorre quando e-mail e senha são informados.
- Se já existir uma conta com esse e-mail, ela não é sobrescrita nem tem a senha redefinida.
- As variáveis definidas por `set` ou `$env:` valem para a sessão/terminal atual. Se executar pelo IntelliJ, configure-as em **Run Configuration > Environment variables**, em vez de presumir que a IDE herdará as variáveis de um CMD separado.
- Nunca publique suas credenciais, nem as envie para uma IA. Ao compartilhar um log, mascare dados sensíveis.

### Passo D — Iniciar backend Spring Boot

No terminal em que as variáveis de administrador foram definidas, navegue até a pasta `backend` e execute:

**CMD:**

~~~cmd
cd backend
.\mvnw.cmd spring-boot:run
~~~

**PowerShell:**

~~~powershell
cd backend
.\mvnw.cmd spring-boot:run
~~~

No macOS/Linux, a partir de `backend`, use `./mvnw spring-boot:run`. O Docker precisa estar disponível nesse sistema e as variáveis de ambiente seguem a sintaxe do shell utilizado.

O Flyway aplica migrations pendentes automaticamente. O Hibernate valida o esquema com `spring.jpa.hibernate.ddl-auto=validate`. **Não execute migrations SQL manualmente no banco** se o Flyway já as gerencia.

Espere a inicialização do Spring Boot; mantenha este terminal aberto.

### Passo E — Verificar backend

Abra no navegador:
- Status: http://localhost:8080/api/status
- Swagger: http://localhost:8080/swagger-ui.html
- OpenAPI: http://localhost:8080/v3/api-docs

O status deverá responder um JSON contendo os campos `status: "OK"` e `application: "Licita.AI"`.

Via CMD:

~~~cmd
curl http://localhost:8080/api/status
~~~

Via PowerShell:

~~~powershell
Invoke-RestMethod http://localhost:8080/api/status
~~~

O backend expõe autenticação em `/api/auth/login`, `/api/auth/me` e `/api/auth/logout`. As operações de contrato ficam em `/api/contratos`. Endpoints protegidos podem retornar HTTP 401 ou 403 se a sessão/perfil não permitir acesso; isso não significa, por si só, que o servidor esteja fora do ar.

### Passo F — Iniciar Angular

Abra **outro terminal**, navegue até a pasta **`frontend` do clone**, e execute:

~~~cmd
npm ci
npm start
~~~

Acesse:
- Aplicação: http://localhost:4200
- Login: http://localhost:4200/login

Na primeira execução, o comando `npm ci` instala as dependências conforme `package-lock.json`. Em execuções seguintes, se o conjunto de dependências não mudou, normalmente basta `npm start`.

Faça login com o **e-mail e a senha escolhidos no Passo C**. Ao entrar, a tela de contratos deve abrir. Em banco novo, a lista pode estar vazia, o que é esperado.

Mantenha o terminal do backend **e** o do Angular abertos durante o uso.

## 5. Validação rápida da instalação

A sequência abaixo verifica as partes essenciais sem exigir dados reais:

1. `git branch --show-current` retorna `develop`.
2. `docker compose ps` mostra o PostgreSQL em execução.
3. Console do backend termina com inicialização bem-sucedida, sem erro de Flyway/JPA.
4. `http://localhost:8080/api/status` responde `status = OK`.
5. `http://localhost:8080/swagger-ui.html` abre.
6. `http://localhost:4200/login` abre.
7. Login com administrador recém-criado permite abrir a tela de contratos.
8. Com dados fictícios válidos e autorização apropriada, cadastro/listagem/detalhes/edição de contratos podem ser testados posteriormente.

Não use dados reais de cidadãos, empresas ou contratos internos para testar sem autorização.

## 6. Executar testes e build

**Backend (dentro de backend):**

~~~cmd
.\mvnw.cmd clean test
~~~

**Frontend (dentro de frontend):**

~~~cmd
npm ci
npm run build
~~~

O GitHub Actions também testa o backend com PostgreSQL temporário e compila o Angular nas branches `develop` e `main` e em PRs direcionados a elas. Passar nesses testes ajuda a validar a integração, mas não substitui os testes manuais de login e fluxo de cadastro.

## 7. Diagnóstico e problemas comuns

### Docker Desktop não iniciou / erro de daemon

Sintomas: `Cannot connect to the Docker daemon`, `docker compose up -d` falha.

1. Abrir Docker Desktop e aguardar inicialização.
2. Rodar `docker info`.
3. Rodar `docker compose up -d` novamente.
4. Se persistir, coletar mensagem completa e verificar WSL 2/virtualização conforme configuração local; não reinstalar tudo sem diagnóstico.

### Porta 5432 ocupada

Sintomas: mensagem de bind, address already in use ou conflito de porta.

~~~cmd
netstat -ano | findstr :5432
docker compose ps
~~~

Identificar qual serviço ocupa a porta. Não encerrar processos desconhecidos ou mudar mapeamentos sem avaliar dependências.

### Backend não conecta ao PostgreSQL

Verificar:

~~~cmd
docker compose ps
docker compose logs postgres --tail=80
~~~

Depois comparar `backend/src/main/resources/application.properties` e `docker-compose.yml`, incluindo URL, porta, banco, usuário e senha. A conexão padrão do Spring usa `jdbc:postgresql://localhost:5432/licita_ai`. Se foram usadas as variáveis `DB_URL`, `DB_USER` e `DB_PASSWORD`, verificar seus valores **sem expor a senha nos logs enviados**.

### Erro de Flyway / JPA / migration

- Copiar o erro completo, a versão da migration e as primeiras linhas relevantes da causa.
- Conferir se o código e as migrations pertencem à mesma branch.
- Não renomear, alterar ou remover uma migration que já foi aplicada.
- Fazer qualquer mudança de esquema em uma **nova** migration versionada.
- Não apagar o volume do banco como primeira opção.

### Porta 8080 ocupada / backend não inicia

~~~cmd
netstat -ano | findstr :8080
~~~

Verifique se outra instância do Spring Boot está aberta no IntelliJ ou em outro terminal. Evite executar duas cópias na mesma porta.

### Porta 4200 ocupada / Angular não abre

~~~cmd
netstat -ano | findstr :4200
~~~

Confirme se já existe um `npm start` rodando. O frontend tem URLs de API apontando para `localhost:8080` no código consultado; alterar a porta do backend sem ajustar o frontend causará problemas de integração.

### Java incorreto / Maven falha

~~~cmd
java -version
where java
cd backend
.\mvnw.cmd -version
~~~

Confirme o Java 21 selecionado no terminal e, se usar IntelliJ, também no Project SDK/Run Configuration.

### Problemas com Node/npm

~~~cmd
node --version
npm --version
cd frontend
npm ci
~~~

Verifique Node 22 e leia o erro do `npm ci`. Evite apagar `package-lock.json`; ele faz parte do projeto.

### Tela de login abre, mas usuário não consegue entrar

1. Confirme backend e PostgreSQL no ar.
2. Confirme que o usuário foi criado no primeiro boot; as variáveis devem estar no processo de execução do backend.
3. Confirme o e-mail informado; autenticação usa e-mail, não nome de usuário.
4. Após 5 tentativas inválidas para uma conta existente, o código prevê **bloqueio temporário de 15 minutos**. Evite repetir tentativas.
5. Uma conta já existente não tem sua senha alterada apenas por mudar `LICITAAI_ADMIN_PASSWORD`.
6. Use a aba Network do navegador e os logs do backend para distinguir erro de senha, sessão ou rede. Não compartilhe a senha nem o cookie de sessão.

### Erro 401/403 em operações de contratos

Existem dois perfis: `ADMIN` pode cadastrar/editar/consultar, e `CONSULTA` possui leitura. A autenticação é baseada em sessão com cookie; a aplicação Angular usa requisições com credenciais. Verifique login e permissões antes de alterar segurança. Não desabilite autenticação para “corrigir” um 403.

### Lista de contratos vazia

Uma instalação nova não traz registros de exemplo. Isso é esperado. Para demonstrações, cadastre um contrato com dados fictícios válidos e respeite as validações da API.

### IntelliJ mostra “No data sources configured” ou “SQL dialect”

É aviso de assistência ao editor, não necessariamente erro de aplicação. A configuração de dialeto PostgreSQL e a conexão JDBC da IDE são independentes da conexão que o Spring Boot usa para executar o Flyway.

## 8. Orientações de segurança e preservação de dados

- Não use credenciais de desenvolvimento em produção.
- Não envie senhas, tokens, cookies, credenciais de bancos, dados pessoais ou dados reais sensíveis à IA.
- Mascare e-mails reais, dados pessoais, números de documentos e segredos em screenshots/logs.
- Não rode scripts de limpeza de volumes, drop de tabelas, reset de banco ou exclusões sem compreender o impacto e ter autorização.
- Não altere diretamente `main` ou `develop` para implementar funcionalidades; crie uma branch e abra Pull Request.
- Para uma instalação nova, o Git clone traz **código e migrations**, mas **não** os dados do PostgreSQL de outro computador.

## 9. Como pedir ajuda a uma IA com este arquivo

Anexe este Markdown à conversa da IA **junto dos erros específicos** (texto dos comandos, logs com segredos removidos e descrição do passo que falhou). Use este prompt:

~~~text
Você está me ajudando a instalar ou executar o projeto Licita.AI em outra máquina.

Leia o guia Markdown anexo e siga a stack oficial: Java 21, Spring Boot 4.1.1,
Angular 22.2 e PostgreSQL 18 com Docker Compose. Não substitua tecnologias
nem proponha refazer o projeto.

Meu sistema operacional é: [preencher]
Minha etapa atual é: [preencher]
Comando que executei: [preencher]
Erro completo, sem senhas ou dados pessoais: [colar]

Quero ajuda passo a passo: sugira somente o próximo teste ou comando,
explique o que ele faz, aguarde meu resultado e então avance.
Não presuma que o problema foi resolvido sem evidência.
Não sugira apagar o banco ou alterar migrations já aplicadas.
Se o guia e o repositório divergirem, priorize o código atual e indique a diferença.
~~~

**Informações úteis ao enviar à IA:**
- Resultado de `java -version`, `node --version` e `docker compose version`.
- Resultado de `git branch --show-current` e `git status`.
- Saída de `docker compose ps`.
- Logs do backend/Angular somente do trecho relevante e sem dados sensíveis.
- Descrição do que funciona e do que não funciona.

## 10. Referências diretas no repositório

- [README principal](../README.md)
- [Docker Compose](../docker-compose.yml)
- [Configuração Spring Boot](../backend/src/main/resources/application.properties)
- [Bootstrap de administrador](../backend/src/main/java/br/edu/unifacol/licitaai/config/AdminBootstrap.java)
- [Configuração de segurança](../backend/src/main/java/br/edu/unifacol/licitaai/config/SecurityConfig.java)
- [Migrações do banco](../backend/src/main/resources/db/migration)
- [Dependências frontend](../frontend/package.json)
- [CI GitHub Actions](../.github/workflows/ci.yml)

**Observação final:** este guia descreve o ambiente local e a estrutura verificada na data de criação. Antes de sugerir alterações, consulte o erro real e os arquivos atuais da branch utilizada.
