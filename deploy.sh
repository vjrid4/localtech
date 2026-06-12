#!/bin/bash

# Zero-downtime deployment script for LocalTech
# Usage: ./deploy.sh localtech

set -e

APP_NAME="${1:-localtech}"
VPS_USER="jvemulapalli"
VPS_HOST="103.191.209.90"
VPS_PORT=65222
SSH_KEY="$HOME/milesweb"
SSH_CMD="ssh -i $SSH_KEY -p $VPS_PORT"

if [ "$APP_NAME" != "localtech" ]; then
  echo "❌ This repo only deploys: localtech"
  exit 1
fi

PORT=3007
REPO_PATH="/var/www/localtech"
ENV_FILE="/var/www/localtech/.env"

IMAGE_NAME="www-$APP_NAME"
CONTAINER_NAME="$APP_NAME"
GIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%s)
NEW_TAG="v${TIMESTAMP}-${GIT_HASH}"

echo "🚀 Starting zero-downtime deployment for $APP_NAME"
echo "   Port: $PORT | Image: $IMAGE_NAME:$NEW_TAG"
echo ""

# Step 1: Push changes to git
echo "📤 Pushing code..."
git add -A
git commit -m "Deploy: $APP_NAME at $NEW_TAG" 2>/dev/null || echo "   (no changes to commit)"
git push

# Step 2: Deploy on VPS
echo "🔨 Deploying on VPS..."
$SSH_CMD -q $VPS_USER@$VPS_HOST bash -s "$REPO_PATH" "$PORT" "$ENV_FILE" "$IMAGE_NAME" "$NEW_TAG" "$CONTAINER_NAME" << 'DEPLOY_SCRIPT'
REPO_PATH=$1
PORT=$2
ENV_FILE=$3
IMAGE_NAME=$4
NEW_TAG=$5
CONTAINER_NAME=$6

set -e

cd "$REPO_PATH"
git pull

# Sync schema (localtech uses prisma db push, not migrations)
echo "   Syncing DB schema..."
docker run --rm \
  --env-file "$ENV_FILE" \
  --network=host \
  -v "$REPO_PATH/prisma:/app/prisma" \
  node:20-bookworm-slim sh -c "apt-get update >/dev/null 2>&1 && apt-get install -y openssl >/dev/null 2>&1 && npm install -g prisma@5 >/dev/null 2>&1 && prisma db push --skip-generate --schema=/app/prisma/schema.prisma" 2>&1 | sed 's/^/   /'
if [ "${PIPESTATUS[0]}" -ne 0 ]; then
  echo "   ❌ Schema sync failed — aborting deploy"
  exit 1
fi

# ── Sync host crontab from ops/crontab.tpl ──
# Source of truth for scheduled jobs lives in the repo, not on the host.
if [ -f "$REPO_PATH/ops/crontab.tpl" ]; then
  echo "   Syncing crontab from ops/crontab.tpl..."
  CRON_SECRET_VAL=$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
  if [ -z "$CRON_SECRET_VAL" ]; then
    echo "   ⚠  CRON_SECRET not set in $ENV_FILE — skipping crontab sync"
  else
    CRON_SECRET="$CRON_SECRET_VAL" envsubst '${CRON_SECRET}' < "$REPO_PATH/ops/crontab.tpl" \
      | crontab - && echo "   ✓ Crontab updated" || echo "   ⚠ Crontab install failed"
  fi
fi

# Build new image with version tag
echo "   Building: $IMAGE_NAME:$NEW_TAG"
if ! docker build -t "$IMAGE_NAME:$NEW_TAG" -f Dockerfile . > /tmp/localtech-build.log 2>&1; then
  echo "   ❌ Docker build failed:"
  tail -20 /tmp/localtech-build.log | sed 's/^/   /'
  exit 1
fi

# Snapshot old image tag for rollback
OLD_IMAGE=$(docker inspect --format='{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "")

# Stop old container to free the port
if [ -n "$OLD_IMAGE" ]; then
  echo "   Stopping old container..."
  docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
  docker rm -f "${CONTAINER_NAME}-old" > /dev/null 2>&1 || true
  docker rename "$CONTAINER_NAME" "${CONTAINER_NAME}-old" > /dev/null 2>&1 || true
fi

# Start new container
echo "   Starting new container..."
docker rm -f "$CONTAINER_NAME" > /dev/null 2>&1 || true
docker run -d \
  --name "$CONTAINER_NAME" \
  --network=host \
  --env-file "$ENV_FILE" \
  -e "PORT=$PORT" \
  -e "HOSTNAME=0.0.0.0" \
  -e "TZ=Asia/Kolkata" \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /home/nextjs \
  --tmpfs /app/.next/cache \
  --security-opt no-new-privileges:true \
  "$IMAGE_NAME:$NEW_TAG" > /dev/null

# Health check — max 30s
echo "   Waiting for container to be healthy..."
HEALTHY=0
for i in $(seq 1 15); do
  if curl -sf "http://localhost:$PORT" > /dev/null 2>&1; then
    HEALTHY=1
    break
  fi
  echo "   ⏳ Waiting... ($i/15)"
  sleep 2
done

if [ $HEALTHY -eq 0 ]; then
  echo "   ❌ New container failed — rolling back..."
  docker logs "$CONTAINER_NAME" --tail 15
  docker rm -f "$CONTAINER_NAME" > /dev/null 2>&1 || true
  if [ -n "$OLD_IMAGE" ]; then
    docker start "${CONTAINER_NAME}-old" > /dev/null 2>&1 && \
    docker rename "${CONTAINER_NAME}-old" "$CONTAINER_NAME" > /dev/null 2>&1 && \
    echo "   ✅ Rolled back to previous version" || \
    echo "   ⚠️  Rollback also failed — start manually with: docker run ... $OLD_IMAGE"
  fi
  exit 1
fi

echo "   ✅ Deployment successful"

# Background: 5-min rollback window, then clean up
(
  sleep 300
  docker rm -f "${CONTAINER_NAME}-old" > /dev/null 2>&1 || true
  CURRENT_IMG=$(docker inspect --format='{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "")
  if [ -n "$CURRENT_IMG" ]; then
    OLD_IMGS=$(docker images --format "{{.Repository}}:{{.Tag}}" \
      | grep "^${IMAGE_NAME}:" \
      | grep -vF "$CURRENT_IMG" || true)
    if [ -n "$OLD_IMGS" ]; then
      echo "$OLD_IMGS" | xargs docker rmi -f > /dev/null 2>&1 || true
    fi
  fi
  docker image prune -f > /dev/null 2>&1 || true
  docker builder prune -f --max-used-space=5GB --min-free-space=10GB > /dev/null 2>&1 \
    || docker builder prune -f --filter "until=24h" > /dev/null 2>&1 \
    || true
) &

DEPLOY_SCRIPT

echo ""
echo "✅ $APP_NAME deployed successfully!"
echo ""
echo "📌 Info:"
echo "   Image: $IMAGE_NAME:$NEW_TAG"
echo "   Port: $PORT"
echo "   URL: https://localtech.in"
echo ""
echo "🔄 Rollback (within 5 min):"
echo "   ssh -i $SSH_KEY -p $VPS_PORT $VPS_USER@$VPS_HOST"
echo "   docker rm -f $CONTAINER_NAME"
echo "   docker rename ${CONTAINER_NAME}-old $CONTAINER_NAME"
