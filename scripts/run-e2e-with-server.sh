#!/bin/bash
# Script to run Playwright e2e tests with a temporary production server on port 3001
# This works around Next.js 16's single-instance dev server lock per directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "Starting Next.js production server on port 3001..."
npm run start -- -H 127.0.0.1 -p 3001 &
SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
  echo "Stopping dev server (PID: $SERVER_PID)..."
  kill $SERVER_PID 2>/dev/null || true
  wait $SERVER_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Waiting for server to be ready..."
sleep 5

# Check if server is responding
for i in {1..30}; do
  if curl -s http://127.0.0.1:3001 > /dev/null 2>&1; then
    echo "Server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Server failed to start after 30 seconds"
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests..."
npx playwright test

echo "Tests complete!"
