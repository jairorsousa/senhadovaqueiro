#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado." >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL nao definido." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-/opt/backups/senha-do-vaqueiro}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/senha-do-vaqueiro-$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

echo "Gerando backup logico do PostgreSQL gerenciado..."
pg_dump --dbname="$DATABASE_URL" --format=custom --file="$BACKUP_FILE"

echo "Removendo backups com mais de $BACKUP_RETENTION_DAYS dias..."
find "$BACKUP_DIR" -name "senha-do-vaqueiro-*.dump" -type f -mtime +"$BACKUP_RETENTION_DAYS" -delete

echo "Backup criado em $BACKUP_FILE"
