# Licita.AI

Sistema web para centralização, consulta e gerenciamento das informações de contratos e processos licitatórios da Prefeitura Municipal de Vitória de Santo Antão.

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

Para executar o projeto localmente, recomenda-se:

- Git;
- Java 21;
- Docker com Docker Compose;
- Node.js 22;
- npm.

O Maven Wrapper já está incluído no backend, portanto não é necessário instalar o Maven globalmente.

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

## Executando localmente

### 1. Iniciar o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d
```

O ambiente local utiliza, por padrão:

```text
Banco:   licita_ai
Usuário: licita
Porta:   5432
```

As configurações podem ser sobrescritas no backend pelas variáveis:

- `DB_URL`;
- `DB_USER`;
- `DB_PASSWORD`.

### 2. Criar o primeiro administrador

Em uma instalação nova, o banco inicia sem usuários ou contratos de exemplo. Se o volume do PostgreSQL já existir, os dados anteriores são preservados.

Para criar o primeiro administrador, defina as variáveis de ambiente antes de iniciar o backend.

No CMD do Windows:

```cmd
set LICITAAI_ADMIN_NOME=Administrador
set LICITAAI_ADMIN_EMAIL=seu-email@exemplo.com
set LICITAAI_ADMIN_PASSWORD=sua-senha-segura
```

A senha deve possuir pelo menos 10 caracteres.

O administrador é criado somente se as variáveis forem informadas e ainda não existir um usuário com o mesmo e-mail.

### 3. Iniciar o backend

```cmd
cd backend
.\mvnw.cmd spring-boot:run
```

Backend:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

### 4. Iniciar o frontend

Em outro terminal:

```cmd
cd frontend
npm ci
npm start
```

Frontend:

```text
http://localhost:4200
```

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
