# Licita.AI

Sistema web para centralização, consulta e gerenciamento das informações de contratos e processos licitatórios da Prefeitura Municipal de Vitória de Santo Antão.

**Novo por aqui?** Veja também o [Guia de instalação, diagnóstico e suporte com IA](docs/GUIA_INSTALACAO_E_SUPORTE_IA.md). Ele pode ser enviado a outra IA para ajudar com a instalação em outra máquina.

## Objetivo

O Licita.AI tem como objetivo organizar em uma única aplicação as principais informações relacionadas aos contratos e processos licitatórios, facilitando o cadastro, a consulta, o acompanhamento de prazos e a localização dos dados.

> Nesta etapa, o sistema armazena apenas informações estruturadas dos contratos e processos licitatórios. Arquivos PDF, DOC ou outros documentos dos contratos não fazem parte do armazenamento da aplicação.

## Stack oficial

### Frontend

- Angular 22.2
- TypeScript
- SCSS
- RxJS

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Hibernate
- Bean Validation
- Flyway

### Banco de dados

- PostgreSQL 18
- Docker / Docker Compose

### Testes e documentação

- JUnit
- Mockito
- Swagger / OpenAPI
- GitHub Actions para integração contínua

### Planejamento futuro

- Integração com Inteligência Artificial: serviço/API ainda a definir
- Hospedagem: ainda a definir

## Funcionalidades atuais

- login e logout;
- autenticação baseada em sessão;
- perfis de usuário `ADMIN` e `CONSULTA`;
- senhas armazenadas com BCrypt;
- bloqueio temporário após tentativas inválidas de login;
- cadastro de informações de contratos;
- edição de contratos existentes;
- listagem e consulta detalhada;
- paginação;
- busca por número do contrato, processo licitatório, empresa e objeto;
- filtros por modalidade e situação;
- acompanhamento de situação do contrato:
  - `NO_PRAZO`;
  - `A_VENCER`;
  - `VENCIDO`;
- alerta de contratos a vencer em até 60 dias;
- validação de CNPJ;
- validação de datas, modalidade e número duplicado do contrato;
- documentação interativa da API com Swagger.

### Permissões

- `ADMIN`: consulta, cadastro e edição de contratos.
- `CONSULTA`: acesso somente às operações de leitura dos contratos.

Atualmente não existe endpoint para exclusão de contratos.

## Estrutura do projeto

```text
Licita.AI/
├── backend/              # API Java / Spring Boot
├── frontend/             # Aplicação Angular
├── docs/                 # Documentação do projeto
├── .github/workflows/    # GitHub Actions / CI
├── docker-compose.yml    # PostgreSQL local
└── README.md
```

## Pré-requisitos

Para executar o projeto localmente, instale:

- **Git**;
- **JDK Java 21** (não apenas o JRE);
- **Node.js 22** com **npm**;
- **Docker Desktop** com Docker Compose (no Windows, abra o Docker Desktop antes de iniciar o banco);
- Opcional: IntelliJ IDEA para Java e VS Code para Angular.

O Maven Wrapper está incluído no backend; não é necessário instalar Maven globalmente.

### Conferir a instalação das ferramentas

No **CMD ou PowerShell do Windows**, execute:

~~~cmd
git --version
java -version
node --version
npm --version
docker --version
docker compose version
docker info
~~~

Verifique **Java 21**, **Node.js 22** e se `docker info` consegue se comunicar com o Docker. Se o daemon estiver indisponível, abra o Docker Desktop e confirme que iniciou corretamente.

Para instruções detalhadas e assistência com erros, consulte o [guia de instalação e suporte com IA](docs/GUIA_INSTALACAO_E_SUPORTE_IA.md).

## Clonando o projeto

O desenvolvimento deve ser feito a partir da branch `develop`.

```bash
git clone -b develop https://github.com/WagnerFO/Licita.AI.git
cd Licita.AI
```

Para confirmar a branch atual:

```bash
git branch
```

O esperado é:

```text
* develop
```

## Executando localmente (Windows)

As etapas abaixo começam na **raiz do projeto `Licita.AI`** após o clone.

### 1. Iniciar o PostgreSQL

Abra o Docker Desktop. Em um terminal, na **raiz do repositório**, execute:

~~~cmd
docker compose up -d
docker compose ps
~~~

O serviço `postgres`/container `licita-postgres` deve aparecer em execução. O ambiente local utiliza:

~~~text
Banco:   licita_ai
Usuário: licita
Porta:   5432
~~~

A configuração está no arquivo `docker-compose.yml`. O backend lê os valores padrão de `application.properties`; é possível sobrescrever a conexão usando as variáveis `DB_URL`, `DB_USER` e `DB_PASSWORD`.

**Atenção:** a configuração do Compose é apenas para desenvolvimento local. O volume do banco preserva os dados entre reinícios. Não execute `docker compose down -v` para resolver um erro sem verificar o impacto: isso pode eliminar o banco de desenvolvimento.

### 2. Criar o primeiro administrador (instalação nova)

O banco inicia **sem usuário ou contrato de exemplo**. Antes de iniciar o backend pela primeira vez, informe os dados do primeiro administrador **no mesmo terminal em que executará o Spring Boot**.

**CMD do Windows:**

~~~cmd
set LICITAAI_ADMIN_NOME=Administrador
set LICITAAI_ADMIN_EMAIL=seu-email@exemplo.com
set LICITAAI_ADMIN_PASSWORD=coloque-aqui-uma-senha-segura
~~~

**PowerShell do Windows:**

~~~powershell
$env:LICITAAI_ADMIN_NOME = "Administrador"
$env:LICITAAI_ADMIN_EMAIL = "seu-email@exemplo.com"
$env:LICITAAI_ADMIN_PASSWORD = "coloque-aqui-uma-senha-segura"
~~~

Substitua o e-mail e a senha de exemplo pelos seus. **A senha precisa conter ao menos 10 caracteres.** O usuário é criado apenas se essas variáveis estiverem informadas e não existir cadastro com o mesmo e-mail.

Se iniciar o backend pelo **IntelliJ IDEA**, configure essas variáveis em **Run Configuration > Environment variables**. Não presuma que a IDE utilizará variáveis definidas em um CMD separado.

As variáveis usadas nos exemplos existem somente na sessão atual do terminal; não há credenciais de login universais publicadas neste repositório.

### 3. Iniciar o backend (Spring Boot)

No terminal com as variáveis de administrador, entre na pasta `backend` e execute:

**Windows (CMD ou PowerShell):**

~~~cmd
cd backend
.\mvnw.cmd spring-boot:run
~~~

**Linux/macOS (shell):**

~~~bash
cd backend
./mvnw spring-boot:run
~~~

Mantenha o terminal aberto. O Flyway aplica automaticamente as migrations pendentes no PostgreSQL; o Hibernate valida a estrutura do banco.

Verifique os endereços:

| Serviço | URL |
|---|---|
| Status do backend | http://localhost:8080/api/status |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |

O endereço de status deve retornar um JSON com `"status":"OK"` e `"application":"Licita.AI"`.

Para testar pelo terminal:

~~~cmd
curl http://localhost:8080/api/status
~~~

Se retornar um erro de conexão, verifique o console do Spring Boot e se a porta 8080 está livre.

### 4. Iniciar o frontend (Angular)

Abra **um segundo terminal** diretamente na pasta `Licita.AI/frontend` (não na pasta `backend`) e execute:

~~~cmd
npm ci
npm start
~~~

Acesse:

- Aplicação: http://localhost:4200
- Login: http://localhost:4200/login

Entre usando **o e-mail e a senha definidos na etapa 2**. Se o banco for novo, é normal a lista de contratos aparecer vazia.

O comando `npm ci` instala as dependências do `package-lock.json`. Em execuções seguintes, normalmente basta `npm start`, desde que as dependências não tenham sido alteradas.

### 5. Verificar se tudo está funcionando

1. `docker compose ps` mostra o banco em execução.
2. O backend inicia sem erro de Flyway/JPA.
3. `http://localhost:8080/api/status` retorna `OK`.
4. O Swagger abre em `http://localhost:8080/swagger-ui.html`.
5. O Angular abre em `http://localhost:4200/login`.
6. O login com a conta criada abre a área de contratos.

Instalar o código em outra máquina **não copia o banco de dados existente** de um computador anterior. Para demonstrações, utilize dados fictícios válidos.

### 6. Problemas comuns

| Problema | Primeira verificação |
|---|---|
| Docker não responde | Abra Docker Desktop e execute `docker info`. |
| PostgreSQL não inicia | `docker compose ps` e `docker compose logs postgres --tail=80`. |
| Porta 5432 ocupada | `netstat -ano \| findstr :5432` no CMD. |
| Backend não abre na porta 8080 | Confira o console do Spring e execute `netstat -ano \| findstr :8080`. |
| Angular não abre | Confira `npm start`, Node 22 e a porta 4200. |
| Falha no primeiro login | Confira as variáveis `LICITAAI_ADMIN_*` no processo do backend e se a conta já existia. |
| Erro 401 ou 403 em contratos | Verifique autenticação/sessão e o perfil `ADMIN` ou `CONSULTA`. |
| Erro do Flyway | Inspecione o erro e as migrations; **não** altere migrations já executadas nem apague volumes como primeira solução. |

**Guia completo para outra máquina ou para pedir ajuda a uma IA:** [docs/GUIA_INSTALACAO_E_SUPORTE_IA.md](docs/GUIA_INSTALACAO_E_SUPORTE_IA.md).


## API principal

### Autenticação

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Contratos

```text
GET  /api/contratos
GET  /api/contratos/{id}
POST /api/contratos
PUT  /api/contratos/{id}
```

A listagem aceita busca, filtros, paginação e limite máximo de 100 registros por página.

## Banco de dados e migrations

O schema do banco é gerenciado pelo Flyway.

Migrations atuais:

```text
V1__create_usuario.sql
V2__seguranca_usuario.sql
V3__create_contrato.sql
```

O Hibernate está configurado com:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Assim, a estrutura do banco é criada e evoluída pelas migrations, enquanto o Hibernate valida a compatibilidade das entidades com o schema.

## Fluxo de branches

A organização adotada no projeto é:

```text
main
└── versão estável/oficial

develop
└── integração e desenvolvimento
```

Novas funcionalidades devem partir da `develop`:

```bash
git switch develop
git pull origin develop
git switch -c feature/nome-da-funcionalidade
```

Exemplo:

```bash
git switch -c feature/cadastro-contratos
```

Depois de concluída e validada, a alteração deve retornar por Pull Request.

Evite desenvolver diretamente na `main`.

## Integração contínua

O GitHub Actions executa automaticamente:

- testes do backend com Maven;
- compilação do frontend Angular;
- PostgreSQL temporário para os testes do backend.

## Histórico da migração

O projeto teve uma implementação intermediária em Flask e SQLite, que foi usada como referência de comportamento.

As funcionalidades úteis foram reimplementadas na stack oficial:

```text
Angular + Java + Spring Boot + PostgreSQL
```

Flask, SQLite, Jinja e testes Python não fazem parte da arquitetura atual.

## Status atual

A base oficial do projeto está consolidada em Java, Spring Boot, Angular e PostgreSQL.

O próximo desenvolvimento deve ocorrer a partir da branch `develop`.
