# Mini CRM de Atendimento

Sistema de gestão de atendimentos para secretárias de clínicas, permitindo cadastro de pacientes e acompanhamento do ciclo de vida dos atendimentos.

## Funcionalidades

- Autenticação com JWT (login/registro)
- Cadastro, edição e exclusão de pacientes
- Registro de atendimentos vinculados a pacientes
- Transição de status: `AGUARDANDO → EM_ATENDIMENTO → FINALIZADO`
- Filtro por status e paginação na lista de atendimentos
- Dashboard com métricas e gráficos
- Busca de pacientes por nome ou telefone

## Stack

| Camada   | Tecnologia                        |
|----------|-----------------------------------|
| Frontend | React 18 + TypeScript + Vite      |
| Backend  | Node.js + Express + TypeScript    |
| Banco    | SQLite (via Prisma ORM)           |
| Infra    | Docker + Docker Compose           |

## Demo online

| Serviço   | URL                                       |
|-----------|-------------------------------------------|
| Frontend  | https://mini-crm-idof.onrender.com        |
| Backend   | https://mini-crm-2-71ff.onrender.com      |

**Credenciais para teste:**
- Email: `admin@yoog.com.br`
- Senha: `123456`

> O backend está hospedado no plano gratuito do Render e pode demorar ~30s para responder na primeira requisição (cold start).

## Como executar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados

### Com Docker (recomendado)

```bash
docker compose up --build
```

O comando irá:
1. Construir as imagens do frontend e backend
2. Executar as migrações do banco de dados
3. Popular o banco com dados de exemplo (seed)
4. Iniciar os servidores

| Serviço   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:5173  |
| Backend   | http://localhost:3000  |

**Credenciais de acesso:**
- Email: `admin@yoog.com.br`
- Senha: `123456`

### Sem Docker (desenvolvimento local)

**Backend:**

```bash
cd server
cp .env.example .env   # ou crie manualmente (ver abaixo)
npm install
npx prisma migrate dev
npx tsx seed.ts
npm run dev
```

**Frontend:**

```bash
cd client
cp .env.example .env   # ou crie manualmente (ver abaixo)
npm install
npm run dev
```

### Variáveis de ambiente

**`server/.env`**
```env
DATABASE_URL=file:./dev.db
JWT_SECRET=sua-chave-secreta
PORT=3000
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:3000/api
```

### Executar testes

```bash
cd server
npm test
```

## Arquitetura

### Backend — Arquitetura em camadas

```
src/
├── controllers/   # Recebe requisição, valida input, chama service, retorna resposta
├── services/      # Regras de negócio (ex: validação de transição de status)
├── repositories/  # Acesso ao banco de dados via Prisma
├── routes/        # Definição de rotas e vinculação com controllers
├── schemas/       # Schemas de validação com Zod
├── middlewares/   # Autenticação JWT
└── tests/         # Testes de integração com Supertest
```

Cada camada tem responsabilidade única. Controllers não conhecem Prisma; services não conhecem HTTP. Isso facilita testes e manutenção.

### Frontend — Organização por páginas

```
src/
├── pages/       # Uma página por domínio (Dashboard, Patients, Services, Login)
├── components/  # Componentes reutilizáveis (Toast)
├── contexts/    # Estado global de autenticação
└── services/    # Cliente HTTP (Axios) com interceptors para token e 401
```

### Banco de dados

Prisma com SQLite em desenvolvimento. As migrações são versionadas em `server/prisma/migrations/` e aplicadas automaticamente ao subir o container.

## Decisões de arquitetura

**SQLite em vez de PostgreSQL**
O enunciado sugere PostgreSQL, mas SQLite foi adotado para simplificar o setup local (zero dependências externas, um único `docker compose up`). A troca para PostgreSQL exige apenas alterar `provider` no `schema.prisma` e a `DATABASE_URL` — o restante do código não muda.

**Validação com Zod**
Schemas de validação declarativos na camada de entrada da API. Erros de validação são capturados pelo middleware global e retornam 400 com array de erros estruturados — sem `if/else` espalhados nos controllers.

**Transição de status como máquina de estados**
A lógica de transição (`AGUARDANDO → EM_ATENDIMENTO → FINALIZADO`) está isolada em `ServiceService`. Qualquer violação lança um erro descritivo que sobe até o middleware de erro e retorna 400. Isso garante que a regra de negócio não vaze para o controller ou repositório.

**Testes de integração, não unitários**
Os testes sobem o app real com banco SQLite em memória e fazem requisições HTTP via Supertest. Isso garante que toda a pilha (validação → controller → service → repository → banco) funciona de ponta a ponta, sem mocks que podem mascarar bugs de integração.

**O que foi deixado de fora**
- Rate limiting na API (não necessário para o escopo)
- Edição de atendimentos além do status (o enunciado não exige)
- Autenticação no frontend além de login (registro é interno/seed)
- Testes de frontend (fora do escopo pedido)
