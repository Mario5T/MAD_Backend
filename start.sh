set -euo pipefail

echo "[start.sh] Bootstrapping MAD_Backend"

node -v || true
npm -v || true

if [ -f package-lock.json ]; then
  echo "[start.sh] Installing deps with npm ci --omit=dev"
  npm ci --omit=dev
else
  echo "[start.sh] Installing deps with npm install --omit=dev"
  npm install --omit=dev
fi
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3000}"

if [ -n "${MONGO_URI:-}" ]; then
  echo "[start.sh] MONGO_URI detected (hidden)"
else
  echo "[start.sh] WARNING: MONGO_URI not set. Using default from code if present."
fi
echo "[start.sh] Starting server on PORT=$PORT"
node src/index.js
