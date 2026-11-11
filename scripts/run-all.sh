#!/usr/bin/env bash
# LogiTrack — run backend + frontend locally (no Docker).
# Prerequisites: JDK 21, Maven 3.9+, Node 20+, MySQL 8 running with logistics_db.
#   1. cp .env.example .env  (edit DB_PASSWORD)
#   2. bash scripts/run-all.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$ROOT/.env" ]; then set -a; . "$ROOT/.env"; set +a; fi
export DB_PASSWORD="${DB_PASSWORD:-logitrack}"
command -v mvn >/dev/null || { echo "Maven 3.9+ is required on PATH"; exit 1; }
(cd "$ROOT/backend" && mvn spring-boot:run) &
BACKEND_PID=$!
(cd "$ROOT/frontend" && npm install && npm start) &
FRONTEND_PID=$!
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' INT TERM EXIT
echo "Backend:  http://localhost:8080/api  (PID $BACKEND_PID)"
echo "Frontend: http://localhost:4200     (PID $FRONTEND_PID)"
wait
