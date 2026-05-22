# PLAN.md - Guia de Implementação do Senha do Vaqueiro

Este documento é o guia prático para desenvolvedores implementarem o **Senha do Vaqueiro** etapa por etapa.

Ele considera a arquitetura recomendada no arquivo `ARQUITETURA-Senha-do-Vaqueiro.md`, o PRD do produto e o design system existentes na raiz do projeto. Também assume que o **deploy inicial será feito em uma VPS compartilhada**, usando Docker para web, API, worker, Redis e Cloudflare Tunnel. O PostgreSQL de produção será gerenciado fora da VPS e acessado apenas via `DATABASE_URL`.

---

## 1. Objetivo do Plano

Entregar o MVP do Senha do Vaqueiro com:

- Site público para vaqueiros visualizarem vaquejadas ativas.
- Fluxo guiado de compra de uma ou mais senhas.
- Cadastro rápido e login do vaqueiro por CPF.
- Pagamento Pix.
- Área do vaqueiro para consultar senhas compradas.
- Área administrativa para cadastrar vaquejadas, categorias, dias, mapas e organizadores.
- Painel do organizador com indicadores, lista de senhas, filtros e impressão.
- Deploy inicial funcional em VPS compartilhada, usando Cloudflare Tunnel.

---

## 2. Stack Definida para o MVP

### Documentos obrigatórios de referência

Antes de implementar qualquer tela, fluxo ou componente, os desenvolvedores devem consultar os documentos da raiz:

| Documento | Uso obrigatório |
|---|---|
| `PRD-Senha-do-Vaqueiro.md` | Regras de produto, jornadas, permissões, status e escopo do MVP |
| `design-system-senha-do-vaqueiro.md` | Base visual obrigatória para frontend, componentes, tokens, temas, linguagem, acessibilidade e responsividade |
| `ARQUITETURA-Senha-do-Vaqueiro.md` | Decisões técnicas, módulos, modelo de dados e fluxos críticos |

O frontend deve se basear diretamente no `design-system-senha-do-vaqueiro.md`. Qualquer novo componente, tela ou variação visual precisa respeitar seus tokens, temas, padrões de layout, componentes recomendados, linguagem e regras mobile-first.

### Monorepo

- `pnpm workspaces`
- TypeScript em todos os pacotes.
- Estrutura com `apps` e `packages`.

### Frontend

- Next.js com App Router.
- React.
- Tailwind CSS.
- Componentes baseados em shadcn/ui ou Radix UI.
- Lucide React para ícones.
- React Hook Form + Zod.
- TanStack Query.
- Implementação visual baseada obrigatoriamente em `design-system-senha-do-vaqueiro.md`.

### Backend

- NestJS.
- Prisma ORM.
- PostgreSQL.
- Redis.
- BullMQ para filas e jobs.
- JWT em cookies HttpOnly.

### Infraestrutura

- VPS Linux compartilhada com outros serviços.
- Docker e Docker Compose.
- Cloudflare Tunnel como proxy público da aplicação.
- SSL/TLS terminado pela Cloudflare.
- PostgreSQL gerenciado em servidor externo.
- Redis em container interno da aplicação, sem publicar porta padrão no host.
- Backups do banco gerenciado pelo provedor e/ou dump lógico remoto.
- Portas internas não padrão para reduzir conflito com outros serviços da VPS.

---

## 3. Estrutura Inicial do Repositório

Criar a estrutura abaixo:

```txt
senha-do-vaqueiro/
  apps/
    web/
    api/
  packages/
    ui/
    shared/
    config/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  docs/
    decisions/
  docker/
    cloudflared/
  scripts/
  .env.example
  docker-compose.yml
  docker-compose.prod.yml
  package.json
  pnpm-workspace.yaml
  README.md
```

### Responsabilidades

| Pasta | Responsabilidade |
|---|---|
| `apps/web` | Site público, área do vaqueiro e admin |
| `apps/api` | API, regras de negócio, jobs e integrações |
| `packages/ui` | Componentes visuais e tokens do design system |
| `packages/shared` | Enums, tipos e schemas compartilhados |
| `packages/config` | Configuração comum de TypeScript, ESLint e Prettier |
| `prisma` | Schema, migrations e seeds |
| `docker` | Configurações de infraestrutura |
| `scripts` | Scripts operacionais |

---

## 4. Ordem Recomendada de Implementação

1. Fundação do monorepo.
2. Banco de dados e modelo inicial.
3. API base e autenticação.
4. Design system e layout base.
5. Admin: vaquejadas, categorias, dias e mapas.
6. Site público: listagem e detalhe de vaquejadas.
7. Checkout: reserva transacional de senhas.
8. Cadastro/login do vaqueiro durante compra.
9. Pagamento Pix.
10. Área do vaqueiro.
11. Painel do organizador.
12. Relatórios e impressão.
13. Testes de concorrência e fluxo completo.
14. Preparação para VPS compartilhada e Cloudflare Tunnel.
15. Monitoramento, backup e operação.

---

## 5. Fase 0 - Preparação do Projeto

### Objetivo

Preparar o repositório para desenvolvimento colaborativo.

### Tarefas

- Criar `package.json` raiz.
- Configurar `pnpm-workspace.yaml`.
- Criar pacotes `apps/web`, `apps/api`, `packages/ui`, `packages/shared`, `packages/config`.
- Configurar TypeScript.
- Configurar ESLint e Prettier.
- Criar `.editorconfig`.
- Criar `.env.example`.
- Criar `README.md` com instruções de ambiente local.
- Criar `docker-compose.yml` para desenvolvimento com PostgreSQL e Redis.

### Scripts mínimos na raiz

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "db:migrate": "pnpm --filter api prisma:migrate",
    "db:seed": "pnpm --filter api prisma:seed"
  }
}
```

### Critérios de aceite

- Desenvolvedor consegue rodar `pnpm install`.
- Desenvolvedor consegue subir PostgreSQL e Redis localmente.
- Monorepo compila sem erros.
- `.env.example` documenta todas as variáveis obrigatórias.

---

## 6. Fase 1 - Banco de Dados e Modelo Inicial

### Objetivo

Criar a base relacional para eventos, usuários, vaqueiros, categorias, mapas, senhas, pedidos e pagamentos.

### Tarefas

- Instalar e configurar Prisma.
- Criar `schema.prisma`.
- Criar enums principais:
  - `UserRole`
  - `EventStatus`
  - `CategoryStatus`
  - `TicketStatus`
  - `OrderStatus`
  - `PaymentStatus`
- Criar tabelas:
  - `users`
  - `cowboys`
  - `events`
  - `event_users`
  - `categories`
  - `event_days`
  - `category_days`
  - `ticket_maps`
  - `ticket_numbers`
  - `orders`
  - `order_items`
  - `payments`
  - `payment_events`
  - `audit_logs`
- Criar índices para filtros administrativos.
- Criar constraints únicas:
  - `events.slug`
  - `cowboys.cpf`
  - `ticket_numbers(ticket_map_id, number)`
  - `payments(provider, provider_payment_id)`
  - `payment_events(provider, external_event_id)`
- Criar seed com:
  - Um admin do sistema.
  - Um organizador.
  - Uma vaquejada de exemplo.
  - Categorias de exemplo.
  - Mapa de senhas de exemplo.

### Critérios de aceite

- Migrations rodam do zero em banco vazio.
- Seed cria dados suficientes para testar o admin e o site público.
- Constraints impedem números duplicados no mesmo mapa.
- CPF é salvo normalizado, apenas com dígitos.

---

## 7. Fase 2 - API Base

### Objetivo

Criar a base NestJS com módulos, validação, autenticação, tratamento de erro e documentação interna.

### Tarefas

- Criar app NestJS em `apps/api`.
- Configurar `ConfigModule`.
- Configurar Prisma como provider.
- Configurar validação global com DTOs.
- Configurar tratamento padronizado de erros.
- Configurar CORS para o domínio do frontend.
- Criar endpoint de saúde:
  - `GET /health`
- Criar estrutura modular:
  - `AuthModule`
  - `UsersModule`
  - `CowboysModule`
  - `EventsModule`
  - `CategoriesModule`
  - `EventDaysModule`
  - `TicketMapModule`
  - `CheckoutModule`
  - `PaymentsModule`
  - `ReportsModule`
  - `AuditModule`
- Criar logger base.

### Critérios de aceite

- API sobe localmente.
- `GET /health` retorna status da API, banco e Redis.
- Erros de validação são claros e padronizados.
- Estrutura de módulos já separa domínios principais.

---

## 8. Fase 3 - Autenticação e Permissões

### Objetivo

Implementar login seguro para administradores, organizadores e vaqueiros.

### Tarefas

- Criar login administrativo:
  - `POST /admin/auth/login`
  - `POST /admin/auth/logout`
  - `GET /admin/auth/me`
- Criar login do vaqueiro:
  - `POST /cowboys/login`
  - `POST /cowboys/logout`
  - `GET /cowboys/me`
- Criar cadastro rápido do vaqueiro:
  - `POST /cowboys/register`
- Criar hash de senha.
- Criar cookies HttpOnly.
- Criar guards:
  - `AdminAuthGuard`
  - `CowboyAuthGuard`
  - `RoleGuard`
  - `EventAccessGuard`
- Implementar RBAC:
  - `SYSTEM_ADMIN`
  - `ORGANIZER`
  - `COWBOY`
- Implementar rate limit para login e cadastro.

### Critérios de aceite

- Admin acessa todas as vaquejadas.
- Organizador acessa apenas vaquejadas vinculadas.
- Vaqueiro acessa apenas seus próprios dados.
- Login com CPF funciona com CPF formatado ou sem formatação.
- Cookies não ficam acessíveis por JavaScript no browser.

---

## 9. Fase 4 - Design System e Frontend Base

### Objetivo

Criar a fundação visual usando obrigatoriamente o arquivo `design-system-senha-do-vaqueiro.md` da raiz do projeto como referência principal.

Essa fase deve transformar o design system documentado em código reutilizável: tokens CSS, tema Tailwind, componentes base, componentes específicos do produto e padrões de layout.

### Tarefas

- Criar app Next.js em `apps/web`.
- Configurar Tailwind.
- Mapear as cores, raios, sombras, espaçamentos, tipografia e estados descritos em `design-system-senha-do-vaqueiro.md`.
- Configurar CSS variables do design system.
- Configurar Tailwind para consumir os tokens do design system, evitando cores hardcoded.
- Criar temas:
  - Dark Mode Rodeio para público.
  - Light Mode Arena para admin.
- Criar componentes base:
  - `Button`
  - `Input`
  - `Select`
  - `Textarea`
  - `Card`
  - `Badge`
  - `Dialog`
  - `Drawer`
  - `Toast`
  - `Skeleton`
  - `DataTable`
- Criar componentes específicos:
  - `EventCard`
  - `CategoryBadge`
  - `StatusBadge`
  - `TicketNumber`
  - `NumberMap`
  - `CheckoutSummary`
  - `PaymentStatus`
  - `AdminStatsCard`
- Criar layouts:
  - Layout público.
  - Layout da área do vaqueiro.
  - Layout administrativo.
- Aplicar padrões de conteúdo do design system:
  - CTAs simples, como `Comprar senha`, `Escolher senha` e `Pagar com Pix`.
  - Mensagens claras de status, erro, pagamento e confirmação.
  - Mobile-first para o site público.
  - Admin mais objetivo e funcional.
- Configurar client HTTP para API.
- Configurar TanStack Query.

### Critérios de aceite

- Frontend segue o arquivo `design-system-senha-do-vaqueiro.md`.
- Tokens de cor são usados via CSS variables.
- Site público abre com tema escuro.
- Admin abre com tema claro.
- Botões e inputs têm estados de loading, erro, foco e disabled.
- Componentes com ícone possuem `aria-label` quando necessário.
- Telas públicas e administrativas respeitam a linguagem, responsividade e acessibilidade definidas no design system.

---

## 10. Fase 5 - Admin de Vaquejadas

### Objetivo

Permitir ao administrador cadastrar e configurar eventos completos.

### Backend

Criar endpoints:

```txt
GET    /admin/events
POST   /admin/events
GET    /admin/events/:id
PATCH  /admin/events/:id
POST   /admin/events/:id/publish
POST   /admin/events/:id/archive
```

### Frontend

Criar telas:

```txt
/admin/vaquejadas
/admin/vaquejadas/nova
/admin/vaquejadas/[id]
```

### Tarefas

- CRUD de vaquejada.
- Upload ou cadastro de URL de banner.
- Status: rascunho, ativa, encerrada e cancelada.
- Validações antes de publicar:
  - Possui pelo menos uma categoria ativa.
  - Possui pelo menos um mapa de senhas.
  - Possui datas válidas.
  - Possui informações principais preenchidas.
- Auditoria de publicação, encerramento e cancelamento.

### Critérios de aceite

- Admin cria uma vaquejada em rascunho.
- Admin edita informações principais.
- Vaquejada só aparece no site público quando estiver ativa.
- Sistema impede publicação incompleta.

---

## 11. Fase 6 - Categorias, Dias e Mapas de Senhas

### Objetivo

Permitir configurar categorias e números disponíveis para venda.

### Backend

Criar endpoints:

```txt
GET    /admin/events/:eventId/categories
POST   /admin/events/:eventId/categories
PATCH  /admin/categories/:id

GET    /admin/events/:eventId/days
POST   /admin/events/:eventId/days
PATCH  /admin/days/:id

GET    /admin/categories/:categoryId/ticket-maps
POST   /admin/categories/:categoryId/ticket-maps
GET    /admin/ticket-maps/:id/numbers
POST   /admin/ticket-numbers/:id/block
POST   /admin/ticket-numbers/:id/unblock
```

### Frontend

Criar telas:

```txt
/admin/vaquejadas/[id]/categorias
/admin/vaquejadas/[id]/dias
/admin/vaquejadas/[id]/mapa
```

### Tarefas

- CRUD de categorias.
- Configurar valor da senha.
- Configurar premiação.
- Configurar quantidade de bois.
- Definir se a categoria usa dias.
- CRUD de dias.
- Criar mapa por intervalo de números.
- Associar mapa à categoria e, se necessário, ao dia.
- Bloquear/desbloquear números manualmente.
- Exibir legenda de status no mapa.

### Critérios de aceite

- Categoria sem organização por dia possui mapa direto.
- Categoria com organização por dia exige escolha do dia no checkout.
- Sistema impede duplicidade de número no mesmo mapa.
- Admin consegue bloquear uma senha para venda.

---

## 12. Fase 7 - Site Público

### Objetivo

Permitir ao vaqueiro encontrar vaquejadas ativas e iniciar a compra.

### Backend

Criar endpoints públicos:

```txt
GET /events
GET /events/:slug
GET /events/:id/categories
GET /categories/:id/days
GET /ticket-maps/:id/numbers
```

### Frontend

Criar telas:

```txt
/
/vaquejadas
/vaquejadas/[slug]
```

### Tarefas

- Listar apenas vaquejadas ativas.
- Criar busca por nome, cidade e estado.
- Exibir detalhes da vaquejada.
- Exibir categorias disponíveis.
- Exibir botão `Comprar senha`.
- Preparar entrada para o fluxo guiado.

### Critérios de aceite

- Vaqueiro vê somente eventos ativos.
- Evento encerrado, cancelado ou rascunho não aparece para compra.
- Tela funciona bem em celular.
- CTA principal é claro.

---

## 13. Fase 8 - Checkout e Reserva Transacional

### Objetivo

Criar o fluxo principal de compra com reserva segura de senhas.

### Fluxo do usuário

1. Escolher categoria.
2. Escolher dia, se a categoria usar dias.
3. Escolher uma ou mais senhas.
4. Entrar ou fazer cadastro rápido.
5. Confirmar dados.
6. Gerar Pix.
7. Aguardar confirmação.

### Backend

Criar endpoints:

```txt
POST /checkout/reserve
GET  /checkout/:orderId
POST /checkout/:orderId/identify
POST /checkout/:orderId/cancel
```

### Regra crítica

A reserva de senha deve acontecer dentro de uma transação no PostgreSQL.

Processo obrigatório:

1. Abrir transação.
2. Buscar os números selecionados com bloqueio de linha.
3. Validar se todos estão `AVAILABLE`.
4. Criar `order`.
5. Criar `order_items`.
6. Alterar senhas para `RESERVED` ou `PENDING_PAYMENT`.
7. Definir `reservedUntil` e `expiresAt`.
8. Fechar transação.

### Frontend

Criar componentes:

- `CheckoutStepper`
- `CategoryStep`
- `DayStep`
- `TicketSelectionStep`
- `IdentificationStep`
- `ConfirmDataStep`
- `PaymentStep`
- `CheckoutSummary`

### Critérios de aceite

- Vaqueiro consegue selecionar múltiplas senhas.
- Senha reservada fica indisponível para outro vaqueiro.
- Se outra pessoa selecionar antes, usuário recebe mensagem clara.
- Pedido possui tempo de expiração.
- Checkout não exige login antes da escolha da senha.

---

## 14. Fase 9 - Pagamento Pix

### Objetivo

Gerar cobrança Pix, receber confirmação e atualizar pedido/senhas.

### Tarefas

- Criar interface `PaymentProvider`.
- Criar provider fake para desenvolvimento.
- Criar adapter real para o provedor Pix escolhido.
- Gerar cobrança Pix para o pedido.
- Salvar:
  - ID externo da cobrança.
  - Valor.
  - QR Code.
  - Copia e cola.
  - Expiração.
- Criar webhook:
  - `POST /webhooks/payments/:provider`
- Validar assinatura ou segredo do webhook.
- Registrar eventos externos em `payment_events`.
- Garantir idempotência.
- Atualizar:
  - `payments.status`
  - `orders.status`
  - `ticket_numbers.status`
- Criar job de expiração de pagamentos pendentes.

### Backend

Endpoints:

```txt
POST /checkout/:orderId/payment
GET  /checkout/:orderId/payment
POST /webhooks/payments/:provider
```

### Frontend

- Exibir QR Code.
- Exibir copia e cola Pix.
- Exibir instruções claras.
- Mostrar status `Aguardando pagamento`.
- Atualizar status por polling inicialmente.
- Preparar evolução futura para realtime.

### Critérios de aceite

- Pedido gera Pix corretamente.
- Webhook duplicado não causa erro nem duplica atualização.
- Pagamento confirmado marca senhas como `PAID`.
- Pagamento expirado libera senhas, quando aplicável.
- Vaqueiro entende que a senha só é confirmada após pagamento.

---

## 15. Fase 10 - Área do Vaqueiro

### Objetivo

Permitir que o vaqueiro consulte e gerencie suas senhas.

### Backend

Criar endpoints:

```txt
GET   /me/tickets
GET   /me/tickets/:id
PATCH /me/tickets/:id
GET   /me/tickets/:id/print
```

### Frontend

Criar telas:

```txt
/minhas-senhas
/minhas-senhas/[id]
```

### Tarefas

- Listar senhas do vaqueiro autenticado.
- Exibir evento, categoria, dia, número e status.
- Exibir pagamentos pendentes.
- Permitir editar informações liberadas pela regra do evento.
- Permitir visualizar/imprimir senha.

### Critérios de aceite

- Vaqueiro vê apenas suas próprias senhas.
- Senhas pagas aparecem como confirmadas.
- Senhas pendentes mostram orientação para pagamento.
- Edição respeita regra do backend.

---

## 16. Fase 11 - Painel do Organizador

### Objetivo

Permitir que o organizador acompanhe vendas e senhas da sua vaquejada.

### Backend

Criar endpoints:

```txt
GET   /admin/events/:eventId/dashboard
GET   /admin/events/:eventId/tickets
GET   /admin/events/:eventId/payments
PATCH /admin/tickets/:id
GET   /admin/tickets/:id/print
```

### Frontend

Criar telas:

```txt
/admin/vaquejadas/[id]/dashboard
/admin/vaquejadas/[id]/senhas
/admin/vaquejadas/[id]/pagamentos
```

### Tarefas

- Dashboard com:
  - Total de senhas vendidas.
  - Senhas disponíveis.
  - Senhas reservadas.
  - Senhas pendentes.
  - Receita confirmada.
  - Receita pendente.
  - Vendas por categoria.
  - Vendas por dia.
- Lista de senhas com filtros:
  - Categoria.
  - Dia.
  - Número.
  - Nome.
  - CPF.
  - Status da senha.
  - Status do pagamento.
- Edição controlada de senha.
- Impressão individual.
- Auditoria das edições.

### Critérios de aceite

- Organizador acessa apenas eventos vinculados.
- Dashboard mostra dados corretos.
- Filtros funcionam.
- Impressão individual funciona.
- Alterações administrativas são auditadas.

---

## 17. Fase 12 - Relatórios

### Objetivo

Entregar relatórios simples para operação do evento.

### Backend

Criar endpoints:

```txt
GET /admin/events/:eventId/reports/summary
GET /admin/events/:eventId/reports/tickets
GET /admin/events/:eventId/reports/payments
GET /admin/events/:eventId/reports/export.csv
```

### Tarefas

- Relatório por categoria.
- Relatório por dia.
- Relatório por status de pagamento.
- Relatório de senhas vendidas.
- Relatório de receita.
- Exportação CSV.

### Critérios de aceite

- Admin e organizador conseguem consultar relatórios do evento.
- Organizador não consegue consultar evento de outro organizador.
- CSV abre corretamente em planilha.

---

## 18. Fase 13 - Testes Obrigatórios

### Objetivo

Garantir que os fluxos principais funcionem e que não exista venda duplicada.

### Testes unitários

- Validação de CPF.
- Normalização de WhatsApp.
- Transições de status de senha.
- Transições de status de pedido.
- Transições de status de pagamento.
- Cálculo de total.
- Permissões por papel.

### Testes de integração

- Criar evento, categoria e mapa.
- Publicar evento.
- Reservar senha disponível.
- Tentar reservar senha indisponível.
- Confirmar webhook Pix.
- Processar webhook duplicado.
- Expirar pagamento pendente.
- Liberar senha após expiração.

### Testes E2E

- Admin cadastra vaquejada completa.
- Vaqueiro compra uma senha.
- Vaqueiro compra múltiplas senhas.
- Webhook fake confirma pagamento.
- Vaqueiro vê senha em `Minhas senhas`.
- Organizador vê venda no dashboard.

### Teste de concorrência

Simular dois usuários tentando comprar a mesma senha ao mesmo tempo.

Critério obrigatório:

- Apenas um usuário consegue reservar a senha.
- O outro recebe a mensagem: `Essa senha acabou de ser selecionada por outra pessoa.`
- O banco não fica com duas vendas para o mesmo número.

---

## 19. Fase 14 - Preparação para VPS Compartilhada

### Objetivo

Preparar o projeto para produção em uma VPS que também roda outros serviços, evitando portas padrão expostas e usando Cloudflare Tunnel como entrada pública.

### Premissas de produção

- Domínio principal: `senhadovaqueiro.com.br`.
- API pública: `api.senhadovaqueiro.com.br`.
- A VPS não é exclusiva do projeto.
- O PostgreSQL de produção é gerenciado e roda em outro servidor.
- O projeto não deve subir container de PostgreSQL em produção.
- Cloudflare Tunnel será o proxy público da aplicação.
- Nginx, Caddy, Certbot e Let's Encrypt não são necessários para este MVP.
- Containers da aplicação não devem publicar `80`, `443`, `3000`, `3333`, `5432` ou `6379` no host.

### Componentes na VPS

- `web`: Next.js, escutando em porta interna não padrão, por exemplo `3100`.
- `api`: NestJS, escutando em porta interna não padrão, por exemplo `3400`.
- `worker`: jobs BullMQ, sem porta pública.
- `redis`: filas/cache, interno ao Docker, por exemplo `6381`, sem porta publicada no host.
- `cloudflared`: túnel Cloudflare encaminhando hostnames públicos para os serviços internos.

### Componentes fora da VPS

- `postgres`: banco gerenciado externo.
- DNS, SSL/TLS e proxy público: Cloudflare.
- Backups principais do banco: provedor do PostgreSQL gerenciado.

### Arquivos necessários

```txt
Dockerfile.web
Dockerfile.api
docker-compose.prod.yml
docker/cloudflared/config.example.yml
.env.production.example
scripts/deploy.sh
scripts/backup-db.sh
scripts/restore-db.sh
```

### Configuração esperada do Cloudflare Tunnel

O repositório deve documentar duas opções:

- Túnel por token, usando `CLOUDFLARE_TUNNEL_TOKEN` no serviço `cloudflared`.
- Túnel por arquivo de configuração, mantendo apenas `config.example.yml` no repositório e nunca versionando credenciais.

Roteamento esperado:

```txt
https://senhadovaqueiro.com.br      -> http://web:3100
https://www.senhadovaqueiro.com.br  -> redirecionar para https://senhadovaqueiro.com.br
https://api.senhadovaqueiro.com.br  -> http://api:3400
```

O endpoint de webhook Pix deve ficar acessível pela API:

```txt
https://api.senhadovaqueiro.com.br/webhooks/payments/:provider
```

### Variáveis de ambiente mínimas

```env
NODE_ENV=production

APP_URL=https://senhadovaqueiro.com.br
API_URL=https://api.senhadovaqueiro.com.br
NEXT_PUBLIC_API_URL=https://api.senhadovaqueiro.com.br

API_PORT=3400
WEB_PORT=3100

DATABASE_URL=postgresql://user:password@host-gerenciado:5432/senha_do_vaqueiro?sslmode=require
REDIS_URL=redis://redis:6381
REDIS_PORT=6381

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
COOKIE_SECRET=

PIX_PROVIDER=
PIX_WEBHOOK_SECRET=
PIX_CLIENT_ID=
PIX_CLIENT_SECRET=
PIX_CERT_PATH=

CLOUDFLARE_TUNNEL_TOKEN=

S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

Não incluir variáveis de criação de PostgreSQL local em produção, como `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD`, porque o banco não roda na VPS.

### Critérios de aceite

- Projeto possui imagem Docker para web.
- Projeto possui imagem Docker para API.
- Worker roda separado da API.
- `docker-compose.prod.yml` não sobe PostgreSQL.
- `docker-compose.prod.yml` sobe `web`, `api`, `worker`, `redis` e `cloudflared`.
- Nenhum serviço da aplicação publica portas padrão no host.
- `.env.production.example` documenta banco gerenciado, Redis interno e Cloudflare Tunnel.
- Cloudflare Tunnel está documentado sem credenciais versionadas.

---

## 20. Fase 15 - Deploy Inicial em VPS com Cloudflare Tunnel

### Objetivo

Colocar a primeira versão no ar com segurança mínima, usando o domínio `senhadovaqueiro.com.br`, Cloudflare Tunnel e PostgreSQL gerenciado externo.

### 20.1 Preparar servidor

Na VPS:

- Criar usuário sem ser `root`.
- Configurar SSH por chave.
- Se possível, usar porta de SSH não padrão definida pelo administrador da VPS.
- Desabilitar login por senha, se possível.
- Instalar Docker.
- Instalar Docker Compose.
- Criar diretório da aplicação:

```txt
/opt/senha-do-vaqueiro
```

Firewall recomendado:

- Permitir apenas a porta de SSH necessária.
- Não abrir `80` e `443` para este projeto, pois o tráfego público entra pelo Cloudflare Tunnel.
- Permitir saída para Cloudflare e para o banco PostgreSQL gerenciado.
- Não expor portas de `web`, `api`, `redis` ou `postgres` no host.

### 20.2 Configurar banco gerenciado

No provedor do PostgreSQL:

- Criar banco de produção.
- Criar usuário da aplicação com permissões mínimas necessárias.
- Habilitar SSL se o provedor exigir.
- Liberar acesso da VPS ao banco, quando houver regra de allowlist.
- Montar `DATABASE_URL` com host externo e `sslmode=require`, se aplicável.
- Testar conexão antes de subir a aplicação.

O projeto deve rodar migrations contra o banco gerenciado:

```txt
docker compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
```

### 20.3 Configurar domínio e Cloudflare

Na Cloudflare:

- Garantir que a zona `senhadovaqueiro.com.br` está ativa.
- Criar um Cloudflare Tunnel para o projeto.
- Configurar public hostnames:
  - `senhadovaqueiro.com.br` para `http://web:3100`.
  - `api.senhadovaqueiro.com.br` para `http://api:3400`.
  - `www.senhadovaqueiro.com.br` como redirect para `senhadovaqueiro.com.br`.
- Usar TLS gerenciado pela Cloudflare.
- Não criar DNS `A` apontando diretamente para a VPS para este projeto.

### 20.4 Configurar compose de produção

O `docker-compose.prod.yml` deve:

- Usar `container_name` ou `project_name` com prefixo do projeto para evitar colisões.
- Criar rede interna própria, por exemplo `senha_do_vaqueiro_prod`.
- Subir `web` em `WEB_PORT=3100`.
- Subir `api` em `API_PORT=3400`.
- Subir `redis` em porta interna não padrão, por exemplo `6381`.
- Subir `cloudflared` com `CLOUDFLARE_TUNNEL_TOKEN`.
- Não publicar portas no host, exceto se uma necessidade operacional for documentada.
- Configurar `restart: unless-stopped` nos serviços de produção.

### 20.5 Subir primeira versão

Fluxo recomendado:

1. Clonar repositório em `/opt/senha-do-vaqueiro`.
2. Criar `.env.production`.
3. Validar conexão com PostgreSQL gerenciado.
4. Criar ou configurar Cloudflare Tunnel.
5. Rodar build das imagens.
6. Subir containers.
7. Rodar migrations.
8. Rodar seed inicial somente se for ambiente novo e controlado.
9. Verificar `https://api.senhadovaqueiro.com.br/health`.
10. Testar login admin.
11. Testar listagem pública em `https://senhadovaqueiro.com.br`.

### 20.6 Script de deploy

Criar `scripts/deploy.sh` com a sequência:

```txt
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
docker compose -f docker-compose.prod.yml --env-file .env.production exec api pnpm prisma migrate deploy
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -fsS https://api.senhadovaqueiro.com.br/health
```

O script real deve tratar falhas, registrar logs e parar o deploy se o health check falhar.

### Critérios de aceite

- `https://senhadovaqueiro.com.br` abre via Cloudflare.
- `https://api.senhadovaqueiro.com.br/health` retorna OK.
- Nenhuma porta padrão da aplicação fica exposta na VPS.
- API conecta ao PostgreSQL gerenciado externo.
- Admin consegue logar.
- Vaquejada ativa aparece no site.
- Checkout funciona em ambiente de produção com provider Pix em modo homologação ou produção.
- Webhook Pix chega pela Cloudflare na API.

---

## 21. Fase 16 - Backup e Operação

### Objetivo

Garantir recuperação básica em caso de falha, considerando que o banco é gerenciado fora da VPS.

### Backups do banco

Prioridade:

- Ativar backup automático no provedor PostgreSQL gerenciado.
- Configurar retenção mínima de 7 dias.
- Habilitar Point-in-Time Recovery, se disponível no plano contratado.
- Documentar como restaurar para um banco novo de validação.

Backup lógico opcional pela VPS:

- Criar `scripts/backup-db.sh` para rodar `pg_dump` contra o banco gerenciado.
- Usar `DATABASE_URL` com SSL quando exigido.
- Salvar arquivo com data e hora.
- Compactar backup.
- Manter retenção local de pelo menos 7 dias.
- Opcionalmente enviar para storage externo.

Exemplo de destino:

```txt
/opt/backups/senha-do-vaqueiro
```

### Restore

Criar `scripts/restore-db.sh` para restaurar backup em um banco de destino informado explicitamente.

Regras:

- Nunca restaurar em produção sem confirmação manual.
- Testar restore em banco separado antes da primeira venda real.
- Documentar tempo aproximado de recuperação.

### Rotina mínima

- Backup automático ativo no provedor do banco.
- Teste de restore antes da primeira venda real.
- Monitorar espaço em disco da VPS.
- Monitorar logs da API, worker, Redis e `cloudflared`.
- Monitorar falhas de webhook.
- Guardar `.env.production` fora do repositório e com backup seguro.

### Critérios de aceite

- Backup automático do banco gerenciado está ativo.
- Existe pelo menos um teste documentado de restore.
- Script de backup lógico remoto existe ou a decisão de usar apenas backup gerenciado está documentada.
- Logs dos containers podem ser consultados.
- Worker reinicia automaticamente se cair.
- `cloudflared` reinicia automaticamente se cair.

---

## 22. Fase 17 - Observabilidade Inicial

### Objetivo

Dar visibilidade mínima para produção em VPS compartilhada com Cloudflare Tunnel e banco externo.

### Implementar

- Logs estruturados na API.
- Logs separados para worker.
- Endpoint `/health`.
- Endpoint interno ou protegido para status de filas.
- Registro de webhooks recebidos.
- Registro de falhas de pagamento.
- Registro de tentativas de reserva concorrente.
- Logs do `cloudflared` acessíveis via Docker.
- Identificador de request nos logs da API.
- Campos de rastreio para pedido, pagamento, vaqueiro e evento.

### Alertas recomendados

- API fora do ar em `https://api.senhadovaqueiro.com.br/health`.
- Tunnel Cloudflare desconectado.
- Banco gerenciado fora do ar ou recusando conexão.
- Redis fora do ar.
- Worker parado.
- Webhooks falhando.
- Muitos pedidos expirando.
- Disco da VPS acima de 80%.
- Uso de CPU/memória da VPS impactando outros serviços.

### Critérios de aceite

- Time consegue identificar falha de API.
- Time consegue identificar falha de worker.
- Time consegue identificar falha do Cloudflare Tunnel.
- Time consegue diferenciar falha de aplicação, banco externo e tunnel.
- Time consegue rastrear um pagamento pelo ID do pedido.
- Time consegue rastrear webhook recebido do provedor Pix.

---

## 23. Definition of Done por Funcionalidade

Uma funcionalidade só deve ser considerada pronta quando:

- Tem validação no backend.
- Tem tratamento de erro amigável no frontend.
- Respeita permissões de usuário.
- Usa os tokens e padrões do arquivo `design-system-senha-do-vaqueiro.md`.
- Funciona em celular.
- Tem loading state.
- Tem estado vazio, quando aplicável.
- Tem teste unitário ou integração proporcional ao risco.
- Não quebra o fluxo de compra.
- Está documentada quando introduzir regra nova.

---

## 24. Checklist do MVP

### Admin

- [ ] Login administrativo.
- [ ] CRUD de vaquejada.
- [ ] CRUD de categoria.
- [ ] CRUD de dias.
- [ ] Configuração de mapa.
- [ ] Bloqueio manual de senha.
- [ ] Cadastro de organizador.
- [ ] Vínculo de organizador à vaquejada.
- [ ] Publicação de vaquejada.

### Site público

- [ ] Home com vaquejadas ativas.
- [ ] Detalhe da vaquejada.
- [ ] Seleção de categoria.
- [ ] Seleção de dia quando houver.
- [ ] Mapa de senhas.
- [ ] Seleção de múltiplas senhas.

### Checkout

- [ ] Reserva transacional.
- [ ] Cadastro rápido.
- [ ] Login do vaqueiro.
- [ ] Confirmação de dados.
- [ ] Geração de Pix.
- [ ] Tela de pagamento aguardando confirmação.
- [ ] Expiração de pagamento.
- [ ] Confirmação por webhook.

### Área do vaqueiro

- [ ] Login com CPF.
- [ ] Listagem de senhas.
- [ ] Detalhe da senha.
- [ ] Impressão ou visualização.
- [ ] Edição permitida.

### Organizador

- [ ] Dashboard da vaquejada.
- [ ] Lista de senhas.
- [ ] Filtros.
- [ ] Consulta de pagamentos.
- [ ] Impressão de senha.
- [ ] Relatórios básicos.

### Produção

- [ ] Dockerfiles.
- [ ] `docker-compose.prod.yml`.
- [ ] Cloudflare Tunnel.
- [ ] TLS via Cloudflare.
- [ ] Variáveis de produção para banco gerenciado.
- [ ] Portas padrão não expostas na VPS.
- [ ] Migrations em produção.
- [ ] Backup do banco gerenciado.
- [ ] Health check.
- [ ] Logs consultáveis.

---

## 25. Prioridade Real do MVP

Se o prazo apertar, priorizar nesta ordem:

1. Admin criar vaquejada, categoria e mapa.
2. Site listar vaquejadas ativas.
3. Vaqueiro escolher senha.
4. Reserva transacional funcionar sem venda duplicada.
5. Cadastro/login do vaqueiro.
6. Pix e confirmação.
7. Área do vaqueiro.
8. Lista administrativa de senhas.
9. Impressão.
10. Dashboard e relatórios.

A regra é simples: sem reserva segura e confirmação de pagamento confiável, o produto não deve abrir venda real.

---

## 26. Riscos Técnicos e Como Tratar

| Risco | Tratamento |
|---|---|
| Venda duplicada da mesma senha | Transação no PostgreSQL com bloqueio de linha e constraint única |
| Webhook Pix duplicado | Tabela `payment_events` com idempotência |
| Pagamento confirmado após expiração local | Consultar status no provedor antes de liberar definitivamente |
| Organizador acessando evento alheio | `EventAccessGuard` em todos os endpoints administrativos por evento |
| Fluxo difícil no celular | Checkout em etapas curtas, CTA claro e linguagem simples |
| Banco gerenciado indisponível | Health check, alertas e plano de comunicação operacional |
| Perda de dados no banco gerenciado | Backup automático do provedor, dump lógico opcional e teste de restore |
| Conflito com outros serviços na VPS | Sem portas padrão publicadas e nomes de containers/redes com prefixo do projeto |
| Cloudflare Tunnel desconectado | Serviço `cloudflared` com restart policy, logs e alerta |
| Worker parado | Restart policy no Docker e alerta |
| Falha no deploy | Script de deploy com checagem de saúde via domínio público após subir |

---

## 27. Primeira Entrega Recomendada

Para a primeira sprint técnica, entregar:

- Monorepo funcionando.
- API NestJS com `/health`.
- PostgreSQL e Redis via Docker Compose.
- Prisma configurado.
- Schema inicial com migrations.
- Seed com admin, organizador, evento, categoria e mapa.
- Web Next.js com layout público e admin vazio.
- Tokens do design system aplicados.

Essa primeira entrega cria o chão certo para o restante do produto crescer sem retrabalho grande.
