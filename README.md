# Projeto: Mini CRM de Atendimento

> ⏱ Duração estimada: 3-4h

## Contexto

Secretárias de clínicas gerenciam solicitações de pacientes e acompanham atendimentos no dia a dia. O objetivo é construir uma versão simplificada desse fluxo.

O foco não é um produto completo, mas sim demonstrar capacidade de estruturar uma aplicação simples de forma limpa e consistente.

## Funcionalidades

- Cadastrar pacientes
- Registrar atendimentos vinculados a um paciente
- Visualizar atendimentos em lista
- Atualizar o status de um atendimento
- Editar ou excluir atendimentos

## Entidades

O sistema opera sobre duas entidades: Paciente (nome, telefone) e Atendimento (vinculado a um paciente, com descrição e status). A modelagem completa (campos adicionais, tipos e relacionamentos) fica deliberadamente a critério do candidato. As escolhas feitas aqui serão avaliadas.

## Regras de Negócio

Atendimentos são criados sempre com status `AGUARDANDO`. A transição segue a sequência abaixo, sem retrocesso nem salto de etapas:

```
AGUARDANDO → EM_ATENDIMENTO → FINALIZADO
```

## Frontend

A interface deve permitir executar todas as funcionalidades listadas acima. Design elaborado não é exigido; qualidade de UX é diferencial. A organização de telas e componentes fica a critério do candidato.

## Backend

API com os endpoints necessários para suportar as operações acima. Nomenclatura e estrutura de rotas ficam a critério do candidato.

Espera-se testes de integração cobrindo os fluxos principais da API. Ao menos: criação de atendimento, tentativa de transição inválida de status (deve retornar erro), e sequência completa de transição até `FINALIZADO`.

## Stack

| Camada   | Tecnologia                                  |
| -------- | ------------------------------------------- |
| Frontend | React (preferencial) ou Vue.js, JS ou TS   |
| Backend  | Node.js ou Python                           |
| Banco    | PostgreSQL                                  |
| Infra    | Docker + Docker Compose                     |

O ambiente completo deve subir com um único `docker compose up`.

## Configuração de Variáveis de Ambiente (.env)

O projeto requer a criação de arquivos `.env` tanto no diretório `client` quanto no diretório `server` para seu correto funcionamento. Crie esses arquivos e os preencha conforme os exemplos abaixo:

### Cliente (`client/.env`)
O frontend utiliza Vite, portanto as variáveis de ambiente devem ser prefixadas com `VITE_`.

```env
VITE_API_URL=http://localhost:3000/api
```

### Servidor (`server/.env`)
O backend requer configurações para o banco de dados e a porta de execução.

```env
DB_PROVIDER=sqlite
DATABASE_URL=file:./dev.db
PORT=3000
NODE_ENV=development
```

> **Nota:** Caso opte por utilizar PostgreSQL ao invés do SQLite padrão (como recomendado na seção Stack), os valores de `DB_PROVIDER` e `DATABASE_URL` no `.env` do servidor deverão ser ajustados para a referida conexão com o PostgreSQL.

## Organização & README

Estrutura de projeto livre. Espera-se que outro dev entenda a arquitetura e consiga rodar o projeto apenas lendo o README.

O README deve conter uma seção de decisões de arquitetura cobrindo: escolhas de estrutura de projeto, o que foi deliberadamente deixado de fora e por quê, e qualquer tradeoff relevante feito durante o desenvolvimento.

## Critérios de Avaliação

- Clareza da arquitetura
- Qualidade e legibilidade do código
- Separação de responsabilidades
- Integração frontend/backend
- Presença e qualidade do teste automatizado
- Clareza das instruções de execução

## Diferenciais (Opcional)

- Validação de dados nas entradas da API
- Paginação ou filtros na lista de atendimentos
- Migrações de banco versionadas
- Logs ou tratamento de erros estruturado
- Testes adicionais além do mínimo
