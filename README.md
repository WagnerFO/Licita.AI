# Licita.AI

Sistema web para centralização e gerenciamento das informações de contratos e processos licitatórios da Prefeitura Municipal de Vitória de Santo Antão.

## Stack oficial

- Frontend: Angular + TypeScript + SCSS
- Backend: Java 21 + Spring Boot
- Persistência: Spring Data JPA + Hibernate
- Banco: PostgreSQL
- Comunicação: API REST + JSON
- Versionamento: Git + GitHub
- Testes: JUnit + Mockito
- API: Swagger / OpenAPI
- IA: integração futura com serviço a definir
- Hospedagem: a definir

O sistema registra e gerencia as informações referentes aos contratos. O documento do contrato em PDF/DOC não faz parte do armazenamento desta versão.

## Funcionalidades migradas

- login e logout;
- perfis ADMIN e CONSULTA;
- bloqueio temporário após tentativas inválidas;
- cadastro e edição das informações de contratos;
- consulta paginada, busca e filtros;
- validação de CNPJ, valores e datas;
- documentação interativa da API.

## Estrutura

backend/ - Spring Boot / REST / JPA / PostgreSQL
frontend/ - Angular
docs/ - documentação
.github/ - CI

## Executar

Banco: docker compose up -d
Backend (PowerShell): cd backend; .\\mvnw.cmd spring-boot:run
Frontend (PowerShell): cd frontend; npm install; npm start

Frontend: http://localhost:4200
API: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html
OpenAPI JSON: http://localhost:8080/v3/api-docs

O banco inicia sem usuários ou contratos de exemplo. Para criar o primeiro administrador sem adicionar dados de exemplo ao código, defina antes de iniciar o backend as variáveis LICITAAI_ADMIN_NOME, LICITAAI_ADMIN_EMAIL e LICITAAI_ADMIN_PASSWORD. O usuário só é criado quando essas variáveis forem fornecidas explicitamente.

## Migração

A implementação Flask/SQLite da linha anterior da main foi usada como referência de comportamento. As regras úteis foram reimplementadas na stack oficial Java/Angular/PostgreSQL. Flask, SQLite, Jinja e testes Python não fazem parte da arquitetura final.
