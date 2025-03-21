#!/bin/sh
set -e

echo "Starting in MODE: $MODE"

case "$MODE" in
  api)
    echo "Running API Server..."
    exec /app/server
    ;;
  frontend)
    echo "Running Frontend..."

    exec npm run start --prefix /app/frontend
    ;;
  runner)
    echo "Running Runner..."
    ls -la /app/runner
    exec npm start --prefix /app/runner
    ;;
    
  *)
    echo "Error: Invalid MODE. Use 'api', 'frontend', or 'runner'."
    exit 1
    ;;
esac
