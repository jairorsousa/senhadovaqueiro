#!/usr/bin/env sh
set -eu

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: RESTORE_DATABASE_URL=postgresql://... scripts/restore-db.sh caminho/backup.dump" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup $BACKUP_FILE nao encontrado." >&2
  exit 1
fi

if [ -z "${RESTORE_DATABASE_URL:-}" ]; then
  echo "RESTORE_DATABASE_URL nao definido. Nunca restaure sem declarar o banco de destino." >&2
  exit 1
fi

echo "Destino: $RESTORE_DATABASE_URL"
printf "Digite RESTAURAR para confirmar: "
read -r CONFIRMATION

if [ "$CONFIRMATION" != "RESTAURAR" ]; then
  echo "Restore cancelado."
  exit 1
fi

pg_restore --dbname="$RESTORE_DATABASE_URL" --clean --if-exists --no-owner "$BACKUP_FILE"

echo "Restore concluido."
