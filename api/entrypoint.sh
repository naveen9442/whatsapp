#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
npx prisma migrate deploy || npx prisma db push --skip-generate

echo "[entrypoint] Starting API server..."
if [ -f "dist/main.js" ]; then
  exec node dist/main.js
elif [ -f "dist/src/main.js" ]; then
  exec node dist/src/main.js
else
  echo "Error: Cannot find main.js in dist/ or dist/src/"
  ls -la dist/
  exit 1
fi
