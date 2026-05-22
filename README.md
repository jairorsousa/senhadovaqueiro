# Senha do Vaqueiro

Monorepo do MVP **Senha do Vaqueiro**, plataforma para venda e gestao de senhas de vaquejada.

## Stack prevista

- `pnpm workspaces`
- TypeScript
- Next.js em `apps/web`
- NestJS em `apps/api`
- PostgreSQL
- Redis
- Prisma
- Docker Compose para ambiente local

## Requisitos

- Node.js 20.11 ou superior
- pnpm 9 ou superior
- Docker e Docker Compose

## Ambiente local

1. Instale as dependencias:

   ```bash
   pnpm install
   ```

2. Crie seu arquivo de ambiente local:

   ```bash
   cp .env.example .env
   ```

3. Suba PostgreSQL e Redis:

   ```bash
   docker compose up -d postgres redis
   ```

   Se a porta `6379` ja estiver ocupada, altere `REDIS_PORT` e `REDIS_URL` no `.env` antes de subir o Redis. Exemplo:

   ```bash
   REDIS_PORT=6380 docker compose up -d redis
   ```

   Se a porta `5432` ja estiver ocupada por outro PostgreSQL local, altere `POSTGRES_PORT` e ajuste `DATABASE_URL` no `.env`.

4. Prepare o banco:

   ```bash
   pnpm --filter api prisma:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. Rode as checagens da base:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```

## Scripts principais

- `pnpm dev`: roda os workspaces em modo desenvolvimento.
- `pnpm --filter web dev`: sobe o frontend Next.js localmente.
- `pnpm --filter api dev`: sobe a API NestJS localmente.
- `pnpm --filter api start`: executa a API compilada.
- `pnpm build`: compila todos os workspaces.
- `pnpm lint`: executa ESLint nos workspaces.
- `pnpm test`: executa os testes configurados nos workspaces.
- `DATABASE_URL="postgresql://..." pnpm --filter api test`: executa tambem os testes de integracao e concorrencia da API contra PostgreSQL.
- `pnpm typecheck`: valida os tipos TypeScript.
- `pnpm --filter api prisma:generate`: gera o Prisma Client.
- `pnpm db:migrate`: executa migrations do Prisma no pacote `api`.
- `pnpm db:seed`: executa o seed do Prisma no pacote `api`.

## Producao

O ambiente de producao foi preparado para uma VPS compartilhada:

- O PostgreSQL nao roda na VPS; use um banco gerenciado externo em `DATABASE_URL`.
- O acesso publico entra pelo Cloudflare Tunnel.
- O dominio principal e `https://senhadovaqueiro.com.br`.
- A API publica fica em `https://api.senhadovaqueiro.com.br`.
- O compose de producao nao publica portas padrao como `80`, `443`, `3000`, `3333`, `5432` ou `6379`.
- O Redis roda apenas na rede interna do Docker, na porta interna `6381` por padrao.

Arquivos principais:

- `Dockerfile.web`: imagem do frontend Next.js.
- `Dockerfile.api`: imagem da API NestJS e do worker.
- `docker-compose.prod.yml`: sobe `web`, `api`, `worker`, `redis` e `cloudflared`.
- `docker/cloudflared/config.example.yml`: exemplo para tunnel configurado por arquivo.
- `.env.production.example`: variaveis de producao sem segredos reais.
- `scripts/deploy.sh`: build, subida, migrations e health check.
- `scripts/backup-db.sh`: backup logico opcional do banco gerenciado.
- `scripts/restore-db.sh`: restore manual com confirmacao explicita.

### Guia de deploy em producao

Este guia assume que voce executara os comandos manualmente na VPS. Nao compartilhe `.env.production`, token da Cloudflare, credenciais do banco ou segredos Pix.

#### 1. Preparar os pre-requisitos

Na sua maquina local, confirme que o projeto esta saudavel antes de enviar para producao:

```bash
pnpm install
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Na VPS, garanta que existem:

- usuario sem ser `root` para operar a aplicacao;
- acesso SSH por chave;
- Docker instalado;
- Docker Compose instalado;
- saida liberada para Cloudflare;
- saida liberada para o host do PostgreSQL gerenciado.

Como a entrada publica sera pelo Cloudflare Tunnel, nao e necessario abrir `80` e `443` para este projeto.

#### 2. Preparar o banco PostgreSQL gerenciado

No provedor do banco:

1. Crie o banco de producao.
2. Crie um usuario especifico para a aplicacao.
3. Habilite SSL, se o provedor exigir.
4. Libere o IP da VPS no allowlist, se o provedor usar regra de rede.
5. Monte a `DATABASE_URL`.

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@host-gerenciado:5432/senha_do_vaqueiro?schema=public&sslmode=require
```

Teste a conexao a partir da VPS antes do deploy:

```bash
psql "$DATABASE_URL" -c "select 1;"
```

#### 3. Configurar Cloudflare Tunnel

Na Cloudflare:

1. Garanta que a zona `senhadovaqueiro.com.br` esta ativa.
2. Crie um tunnel para a aplicacao.
3. Configure os public hostnames:
   - `senhadovaqueiro.com.br` apontando para `http://web:3100`;
   - `api.senhadovaqueiro.com.br` apontando para `http://api:3400`;
   - `www.senhadovaqueiro.com.br` redirecionando para `senhadovaqueiro.com.br`.
4. Copie o token do tunnel para `CLOUDFLARE_TUNNEL_TOKEN`.

O arquivo `docker/cloudflared/config.example.yml` mostra a topologia esperada para quem preferir tunnel por arquivo de configuracao. Nunca versione credenciais reais da Cloudflare.

#### 4. Instalar o projeto na VPS

Crie o diretorio da aplicacao:

```bash
sudo mkdir -p /opt/senha-do-vaqueiro
sudo chown "$USER":"$USER" /opt/senha-do-vaqueiro
cd /opt/senha-do-vaqueiro
```

Clone o repositorio:

```bash
git clone <URL_DO_REPOSITORIO> .
```

Crie o ambiente de producao:

```bash
cp .env.production.example .env.production
nano .env.production
```

Preencha pelo menos:

- `APP_URL=https://senhadovaqueiro.com.br`
- `API_URL=https://api.senhadovaqueiro.com.br`
- `NEXT_PUBLIC_API_URL=https://api.senhadovaqueiro.com.br`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `COOKIE_DOMAIN=.senhadovaqueiro.com.br`
- `COOKIE_SECURE=true`
- `CLOUDFLARE_TUNNEL_TOKEN=...`
- variaveis Pix reais ou de homologacao.

Gere segredos fortes, por exemplo:

```bash
openssl rand -hex 32
```

#### 5. Validar a configuracao do Compose

Antes de subir:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production config --quiet
```

Opcionalmente confira se nao ha portas publicadas:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production config | grep -n "ports:"
```

O comando acima nao deve listar portas para `web`, `api`, `redis`, `worker` ou `cloudflared`.

#### 6. Buildar e subir os containers

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Servicos esperados:

- `senha-do-vaqueiro-prod-web`
- `senha-do-vaqueiro-prod-api`
- `senha-do-vaqueiro-prod-worker`
- `senha-do-vaqueiro-prod-redis`
- `senha-do-vaqueiro-prod-cloudflared`

#### 7. Rodar migrations

Depois que a API estiver de pe:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T api pnpm exec prisma migrate deploy --schema prisma/schema.prisma
```

Use seed em producao somente se for um banco novo e voce realmente quiser criar os dados iniciais:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T api pnpm --filter api prisma:seed
```

Se usar seed, troque imediatamente as senhas padrao.

#### 8. Validar a aplicacao no ar

Verifique health check da API:

```bash
curl -fsS https://api.senhadovaqueiro.com.br/health
```

Verifique o site:

```bash
curl -I https://senhadovaqueiro.com.br
```

Depois teste pelo navegador:

1. Acesse `https://senhadovaqueiro.com.br`.
2. Acesse `https://senhadovaqueiro.com.br/admin`.
3. Faca login administrativo.
4. Confirme que a listagem publica abre.
5. Confirme que o checkout gera Pix em modo homologacao ou producao.
6. Confirme que o webhook Pix usa `https://api.senhadovaqueiro.com.br/webhooks/payments/:provider`.

#### 9. Operacao basica

Ver logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f worker
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f cloudflared
```

Reiniciar um servico:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart api
```

Atualizar a aplicacao:

```bash
./scripts/deploy.sh
```

Backup logico opcional do banco gerenciado:

```bash
./scripts/backup-db.sh
```

Restore manual em um banco de destino:

```bash
RESTORE_DATABASE_URL="postgresql://usuario:senha@host:5432/banco_destino?sslmode=require" ./scripts/restore-db.sh /opt/backups/senha-do-vaqueiro/arquivo.dump
```

Nunca restaure em producao sem antes testar em um banco separado.

#### 10. Checklist antes da primeira venda real

- `https://senhadovaqueiro.com.br` abre corretamente.
- `https://api.senhadovaqueiro.com.br/health` retorna OK.
- Banco gerenciado tem backup automatico ativo.
- Restore foi testado em banco separado.
- Cloudflare Tunnel esta conectado.
- API, worker e Redis estao com `restart: unless-stopped`.
- Pix esta em modo correto.
- Webhook Pix foi testado.
- Admin padrao foi removido ou teve senha trocada.
- `.env.production` esta fora do Git e protegido na VPS.

## Dados iniciais

O seed cria:

- Admin: `admin@senhadovaqueiro.local`
- Organizador: `organizador@senhadovaqueiro.local`
- Vaqueiro demo com CPF normalizado: `12345678909`
- Vaquejada publica: `vaquejada-parque-modelo`
- Categorias `Aberta` e `Aspirante`
- Dois mapas de senhas com 50 numeros disponiveis no total

A senha padrao local do seed e `change-me-now`.

## API

A API fica em `apps/api` e usa NestJS.

Rotas iniciais:

- `GET /health`: retorna status da API, PostgreSQL e Redis.
- `GET /health?verbose=true`: inclui informacoes basicas de runtime.
- `POST /admin/auth/login`: login de administrador ou organizador.
- `POST /admin/auth/logout`: encerra a sessao administrativa.
- `GET /admin/auth/me`: retorna a sessao administrativa atual.
- `POST /cowboys/login`: login do vaqueiro por CPF.
- `POST /cowboys/logout`: encerra a sessao do vaqueiro.
- `GET /cowboys/me`: retorna a sessao atual do vaqueiro.
- `POST /cowboys/register`: cadastro rapido do vaqueiro.
- `GET /admin/events/:eventId/access-check`: valida acesso administrativo a uma vaquejada.
- `GET /admin/events`: lista vaquejadas do administrador ou organizador.
- `POST /admin/events`: cria uma vaquejada em rascunho.
- `GET /admin/events/:id`: retorna detalhes administrativos da vaquejada.
- `PATCH /admin/events/:id`: edita informacoes principais ou cancela uma vaquejada.
- `POST /admin/events/:id/publish`: publica uma vaquejada completa.
- `POST /admin/events/:id/archive`: encerra uma vaquejada.
- `GET /admin/events/:eventId/categories`: lista categorias da vaquejada.
- `POST /admin/events/:eventId/categories`: cria categoria com valor, premio e regra de dias.
- `PATCH /admin/categories/:id`: edita categoria ou altera status.
- `GET /admin/events/:eventId/days`: lista dias da vaquejada.
- `POST /admin/events/:eventId/days`: cria dia da vaquejada.
- `PATCH /admin/days/:id`: edita dia da vaquejada.
- `GET /admin/categories/:categoryId/ticket-maps`: lista mapas de uma categoria.
- `POST /admin/categories/:categoryId/ticket-maps`: cria mapa e numeros por intervalo.
- `GET /admin/ticket-maps/:id/numbers`: lista numeros de um mapa.
- `POST /admin/ticket-numbers/:id/block`: bloqueia uma senha disponivel.
- `POST /admin/ticket-numbers/:id/unblock`: desbloqueia uma senha bloqueada.
- `GET /admin/events/:eventId/dashboard`: indicadores do painel do organizador.
- `GET /admin/events/:eventId/tickets`: lista senhas com filtros administrativos.
- `GET /admin/events/:eventId/payments`: lista pagamentos da vaquejada.
- `PATCH /admin/tickets/:id`: edicao administrativa controlada de senha.
- `GET /admin/tickets/:id/print`: dados para impressao individual da senha.
- `GET /admin/events/:eventId/reports/summary`: resumo de relatorios por categoria, dia e pagamento.
- `GET /admin/events/:eventId/reports/tickets`: relatorio de senhas vendidas.
- `GET /admin/events/:eventId/reports/payments`: relatorio de pagamentos e receita.
- `GET /admin/events/:eventId/reports/export.csv`: exportacao CSV para planilha.
- `GET /events`: lista somente vaquejadas ativas, com busca opcional por `q`.
- `GET /events/:slug`: retorna detalhe publico de uma vaquejada ativa.
- `GET /events/:id/categories`: lista categorias ativas de uma vaquejada ativa.
- `GET /categories/:id/days`: lista dias disponiveis para uma categoria ativa.
- `GET /ticket-maps/:id/numbers`: lista numeros publicos de um mapa ativo.
- `POST /checkout/reserve`: reserva senhas em transacao PostgreSQL.
- `GET /checkout/:orderId`: retorna pedido de checkout.
- `POST /checkout/:orderId/identify`: identifica ou cadastra o vaqueiro do pedido.
- `POST /checkout/:orderId/cancel`: cancela o pedido e libera senhas reservadas.
- `POST /checkout/:orderId/payment`: gera uma cobranca Pix para pedido identificado.
- `GET /checkout/:orderId/payment`: consulta o pagamento mais recente do pedido.
- `POST /webhooks/payments/:provider`: recebe webhook Pix com idempotencia por evento externo.

No ambiente local, `PIX_PROVIDER=mock` usa o provider fake. Para confirmar um pagamento fake, envie um webhook com `providerPaymentId`, `status=PAID` e o segredo configurado em `PIX_WEBHOOK_SECRET`.

As sessoes usam cookies `HttpOnly`:

- `admin_access` para administradores e organizadores.
- `cowboy_access` para vaqueiros.

Para rodar localmente:

```bash
pnpm --filter api dev
```

Se voce alterou `POSTGRES_PORT` ou `REDIS_PORT` no `.env`, ajuste tambem `DATABASE_URL` e `REDIS_URL`.

## Web

O frontend fica em `apps/web` e usa Next.js App Router, Tailwind CSS, TanStack Query e os componentes compartilhados de `packages/ui`.

Rotas iniciais:

- `/`: experiencia publica em Dark Mode Rodeio.
- `/vaquejadas`: listagem publica de vaquejadas ativas com busca.
- `/vaquejadas/[slug]`: detalhe publico da vaquejada e entrada para compra.
- Seção `#checkout` no detalhe publico: fluxo guiado de categoria, dia, senhas, identificacao e confirmacao.
- A etapa Pix do checkout exibe QR Code, copia e cola, status e faz polling do pagamento.
- `/minhas-senhas`: area inicial do vaqueiro autenticado.
- `/admin`: dashboard base em Light Mode Arena.
- `/admin/vaquejadas`: listagem administrativa de vaquejadas.
- `/admin/vaquejadas/nova`: cadastro de vaquejada em rascunho.
- `/admin/vaquejadas/[id]`: detalhes, checklist de publicacao e acoes administrativas.
- `/admin/vaquejadas/[id]/editar`: edicao de informacoes principais.
- `/admin/vaquejadas/[id]/categorias`: configuracao de categorias, valores e premiacao.
- `/admin/vaquejadas/[id]/dias`: configuracao dos dias da vaquejada.
- `/admin/vaquejadas/[id]/mapa`: criacao de mapas e bloqueio/desbloqueio de senhas.
- `/admin/vaquejadas/[id]/dashboard`: indicadores do organizador.
- `/admin/vaquejadas/[id]/senhas`: filtros, edicao controlada e impressao individual.
- `/admin/vaquejadas/[id]/pagamentos`: consulta de pagamentos por status e filtros.
- `/admin/vaquejadas/[id]/relatorios`: relatorios operacionais e exportacao CSV.

Para rodar localmente:

```bash
pnpm --filter web dev
```

O cliente HTTP usa `NEXT_PUBLIC_API_URL` para chamadas feitas pelo navegador.

## Estrutura

```txt
apps/
  web/      # Site publico, area do vaqueiro e admin
  api/      # API, regras de negocio, jobs e integracoes
packages/
  ui/       # Componentes visuais e tokens compartilhados
  shared/   # Tipos, constantes e schemas compartilhados
  config/   # Configuracoes comuns de TypeScript, ESLint e Prettier
prisma/     # Schema, migrations e seed
docs/       # Decisoes tecnicas
docker/     # Configuracoes de infraestrutura
scripts/    # Scripts operacionais
```

## Documentos de referencia

- `PLAN.md`
- `PRD-Senha-do-Vaqueiro.md`
- `ARQUITETURA-Senha-do-Vaqueiro.md`
- `design-system-senha-do-vaqueiro.md`
