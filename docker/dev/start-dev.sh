#!/bin/sh
set -e

if [ ! -d /app/node_modules ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting frontend in development mode..."
exec npm run dev -- --host 0.0.0.0 --port 5173
