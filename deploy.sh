#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/migymapp"
BACKUP_DIR="$APP_DIR/backups"
SERVICE="migymapp.service"
DATE_TAG=$(date +%Y%m%d-%H%M%S)
RUN_AS="migymapp"

cd "$APP_DIR"

# Load production environment variables
set -a
source "$APP_DIR/.env"
set +a

DB_URL="${DATABASE_URL%%\?*}"

echo "==> [1/6] Backing up database"
mkdir -p "$BACKUP_DIR"
pg_dump "$DB_URL" > "$BACKUP_DIR/migymapp-pre-deploy-${DATE_TAG}.sql"

echo "==> [2/6] Fetching latest code from origin/main"
runuser -u "$RUN_AS" -- git -C "$APP_DIR" fetch origin main
runuser -u "$RUN_AS" -- git -C "$APP_DIR" reset --hard origin/main

echo "==> [3/6] Installing dependencies"
# NODE_ENV=production from .env would skip devDependencies,
# which are required for the Next.js build step.
runuser -u "$RUN_AS" -- bash -c "cd $APP_DIR && NODE_ENV=development npm ci"

echo "==> [4/6] Applying database migrations"
runuser -u "$RUN_AS" -- bash -c "cd $APP_DIR && npx prisma migrate deploy"

echo "==> [5/6] Generating Prisma client"
runuser -u "$RUN_AS" -- bash -c "cd $APP_DIR && npx prisma generate"

echo "==> [6/6] Building application"
runuser -u "$RUN_AS" -- npm run build

echo "==> [7/6] Restarting service"
sudo systemctl restart "$SERVICE"

echo "==> Deployment complete"
sudo systemctl status "$SERVICE" --no-pager
