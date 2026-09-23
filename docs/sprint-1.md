# Sprint 1 — Licita.AI

## 1. Objetivo da Sprint

Construir a estrutura técnica inicial do Licita.AI, preparando o projeto para o desenvolvimento das funcionalidades de autenticação, cadastro e consulta das informações referentes aos contratos.

Nesta Sprint, a prioridade inicial é estabelecer uma base organizada e funcional para backend, frontend, banco de dados e integração contínua.

---

## 2. Escopo

A Sprint 1 contempla inicialmente:

* configuração do repositório;
* organização das branches;
* configuração do backend;
* configuração do frontend;
* integração com banco de dados;
* controle de migrations;
* configuração do ambiente com Docker;
* pipeline de integração contínua;
* preparação da estrutura necessária para autenticação;
* preparação da estrutura para gerenciamento das informações dos contratos.

## 3. Regra sobre contratos

O Licita.AI não armazenará, nesta proposta, o documento físico ou digital do contrato em PDF, DOC ou outro formato.

O sistema será responsável pelo cadastro e gerenciamento das **informações referentes ao contrato**.

Exemplos dessas informações poderão incluir futuramente:

* número do contrato;
* objeto;
* empresa contratada;
* valor;
* período de vigência;
* situação;
* modalidade;
* demais informações definidas pelos requisitos do sistema.

Nesta etapa ainda não serão inseridos dados reais ou registros de exemplo.

---

## 4. Funcionalidades previstas para a Sprint

### US01 — Autenticação

Preparar e posteriormente implementar o acesso de usuários ao sistema através de autenticação.

### US02 — Cadastro de informações de contratos

Permitir posteriormente o cadastro das informações referentes aos contratos municipais.

### US03 — Consulta de contratos

Permitir posteriormente a consulta das informações dos contratos cadastrados.

---

## 5. Arquitetura inicial

O projeto utiliza uma arquitetura separada entre frontend, backend e banco de dados.

```text
Usuário
   |
   v
Angular
Frontend
   |
   | REST
   v
Spring Boot
Backend
   |
   | JPA / Hibernate
   v
PostgreSQL
```

### Backend

Tecnologias utilizadas:

* Java 21;
* Spring Boot;
* Spring Web;
* Spring Data JPA;
* Spring Security;
* Bean Validation;
* Flyway;
* Maven.

Estrutura inicial:

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

Tecnologias utilizadas:

* Angular 22;
* TypeScript;
* SCSS.

Estrutura inicial:

```text
core/
shared/
features/
├── auth/
└── contratos/
```

### Banco de Dados

O banco de dados utilizado é o PostgreSQL 18.

O banco é executado em ambiente de desenvolvimento através do Docker Compose.

As alterações estruturais do banco são controladas pelo Flyway.

---

## 6. Ambiente de desenvolvimento

Principais ferramentas utilizadas:

* Git;
* GitHub;
* Java 21;
* Maven;
* Node.js;
* npm;
* Angular;
* PostgreSQL;
* Docker;
* Docker Compose;
* Visual Studio Code.

---

## 7. Integração Contínua

O projeto possui um workflow configurado no GitHub Actions.

A pipeline realiza automaticamente:

### Backend

* preparação do Java 21;
* inicialização de PostgreSQL 18;
* execução do Maven;
* execução dos testes do backend.

### Frontend

* preparação do Node.js;
* instalação das dependências com `npm ci`;
* build da aplicação Angular.

O workflow é executado para alterações nas branches:

```text
develop
main
```

---

## 8. Estratégia de branches

O projeto utiliza inicialmente:

```text
main
develop
feature/*
```

### main

Contém a versão estável do projeto.

### develop

Branch utilizada para integração do desenvolvimento.

### feature/*

Branches destinadas ao desenvolvimento de funcionalidades específicas.

---

## 9. Estrutura atual do projeto

```text
Licita.AI/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
├── docs/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

## 10. Situação atual

Até o momento foram concluídos:

* criação e configuração do repositório;
* criação da branch `develop`;
* configuração do backend Spring Boot;
* configuração do frontend Angular;
* configuração do PostgreSQL;
* configuração do Docker Compose;
* configuração do Flyway;
* criação da estrutura inicial de usuários no banco;
* criação da estrutura de pacotes do backend;
* criação da estrutura inicial do frontend;
* integração do backend com PostgreSQL;
* execução do backend;
* execução do frontend;
* configuração do GitHub Actions;
* validação do build do frontend;
* validação dos testes do backend no CI.

---

## 11. Próximos passos

Após a consolidação da estrutura inicial, o desenvolvimento seguirá para:

1. definição das estruturas de domínio necessárias;
2. autenticação de usuários;
3. estrutura das informações referentes aos contratos;
4. rotas REST;
5. telas Angular;
6. integração entre frontend e backend;
7. testes das funcionalidades.

A inclusão de registros reais ficará para uma etapa posterior ao desenvolvimento da estrutura necessária.
