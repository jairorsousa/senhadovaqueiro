#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
HEALTH_URL="${HEALTH_URL:-https://api.senhadovaqueiro.com.br/health}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado." >&2
  exit 1
fi

echo "Atualizando codigo..."
git pull --ff-only

echo "Construindo imagens de producao..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build

echo "Subindo servicos..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

echo "Executando migrations no PostgreSQL gerenciado..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T api \
  pnpm exec prisma migrate deploy --schema prisma/schema.prisma

echo "Status dos containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Validando health check publico..."
curl -fsS "$HEALTH_URL" >/dev/null

echo "Deploy concluido com sucesso."
