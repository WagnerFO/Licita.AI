# Licita.AI

Sistema web para centralização e gerenciamento de informações relacionadas a contratos e processos licitatórios da Prefeitura Municipal de Vitória de Santo Antão.

## Objetivo

O Licita.AI tem como objetivo organizar, centralizar e facilitar a consulta das informações referentes aos contratos e processos licitatórios municipais.

> O sistema não tem como objetivo armazenar o documento do contrato em PDF, DOC ou outro formato. Serão cadastradas e gerenciadas as informações referentes a cada contrato.

## Tecnologias

### Frontend

* Angular 22
* TypeScript
* SCSS

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Maven

### Banco de Dados

* PostgreSQL 18
* Flyway

### DevOps

* Docker
* Docker Compose
* Git
* GitHub Actions

## Estrutura do projeto

```text
Licita.AI/
├── backend/
├── frontend/
├── docs/
├── .github/
│   └── workflows/
├── docker-compose.yml
└── README.md
```

### Backend

A aplicação backend está organizada nas seguintes camadas:

```text
config/
controller/
dto/
entity/
exception/
repository/
security/
service/
```

### Frontend

A aplicação Angular possui inicialmente a seguinte estrutura:

```text
core/
shared/
features/
├── auth/
└── contratos/
```

## Banco de Dados

O PostgreSQL é executado utilizando Docker.

As alterações da estrutura do banco serão controladas pelo Flyway.

Atualmente existe a estrutura inicial da tabela de usuários necessária para a futura implementação da autenticação.

## CI

O projeto utiliza GitHub Actions para validar automaticamente:

* compilação e testes do backend;
* conexão com PostgreSQL durante os testes;
* instalação das dependências do frontend;
* build da aplicação Angular.

O workflow é executado em pushes e pull requests para as branches `develop` e `main`.

## Branches

```text
main
develop
feature/*
```

* `main`: versão estável do projeto.
* `develop`: integração do desenvolvimento.
* `feature/*`: desenvolvimento de funcionalidades específicas.

## Como executar

### Banco de Dados

Na raiz do projeto:

```bash
docker compose up -d
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

No Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend disponível em:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend disponível em:

```text
http://localhost:4200
```

## Sprint 1

Nesta primeira etapa, o foco é estabelecer a base técnica e funcional do Licita.AI.

### Estrutura já preparada

* Repositório Git e organização de branches.
* Backend Spring Boot.
* Frontend Angular.
* PostgreSQL com Docker.
* Controle de migrations com Flyway.
* Estrutura inicial das camadas do backend.
* Estrutura inicial do frontend.
* Pipeline de integração contínua com GitHub Actions.

### Funcionalidades previstas

* Autenticação de usuários.
* Cadastro das informações referentes aos contratos.
* Consulta das informações dos contratos.

Nesta fase inicial, a prioridade é consolidar a estrutura do sistema antes da inclusão de dados e da implementação completa das funcionalidades.
