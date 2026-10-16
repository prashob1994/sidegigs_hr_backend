#!/usr/bin/env bash
# =============================================================
#  deploy.sh — SidGigs HR Backend Deployment Script
#
#  Usage:
#    chmod +x deploy.sh       (first time only)
#    ./deploy.sh              (deploy with defaults)
#    ./deploy.sh --branch main --no-cache
#
#  What it does:
#    1. Pull latest code from Git
#    2. Copy / refresh environment variables (.env)
#    3. Install / update npm dependencies (inside Docker build)
#    4. docker-compose down  → stop running containers
#    5. docker-compose up    → rebuild image and start containers
#    6. Stream live logs for 20 seconds to confirm healthy start
# =============================================================

set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

# ── Default config ─────────────────────────────────────────────
BRANCH="${BRANCH:-main}"
NO_CACHE=""
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
LOG_TAIL_SECONDS=20

# ── Argument parsing ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --branch)   BRANCH="$2"; shift 2 ;;
    --no-cache) NO_CACHE="--no-cache"; shift ;;
    --compose)  COMPOSE_FILE="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--branch <branch>] [--no-cache] [--compose <file>]"
      exit 0
      ;;
    *) warn "Unknown argument: $1"; shift ;;
  esac
done

# ── Resolve project root ───────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}============================================${RESET}"
echo -e "${BOLD}  🚀  SidGigs HR Backend — Deploy Script   ${RESET}"
echo -e "${BOLD}============================================${RESET}"
echo ""

# ── Prerequisite checks ────────────────────────────────────────
info "Checking prerequisites..."

command -v git    &>/dev/null || error "git is not installed."
command -v docker &>/dev/null || error "docker is not installed."
command -v docker-compose &>/dev/null || \
  docker compose version   &>/dev/null || \
  error "docker-compose is not installed."

# Detect 'docker compose' vs 'docker-compose'
if docker compose version &>/dev/null 2>&1; then
  DC="docker compose"
else
  DC="docker-compose"
fi

success "Prerequisites OK  (compose command: '$DC')"
echo ""

# ── Step 1 — Git pull ──────────────────────────────────────────
info "Step 1/5 → Pulling latest code from origin/${BRANCH} ..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
success "Code is up to date."
echo ""

# ── Step 2 — Validate .env ────────────────────────────────────
info "Step 2/5 → Checking .env file ..."
if [[ ! -f ".env" ]]; then
  if [[ -f ".env-example" ]]; then
    warn ".env not found — copying from .env-example. Edit it before proceeding!"
    cp .env-example .env
  else
    error ".env file missing and no .env-example to copy from. Create a .env file first."
  fi
else
  success ".env file present."
fi
echo ""

# ── Step 3 — Load .env so compose picks up variables ──────────
set -o allexport
# shellcheck disable=SC1091
source .env
set +o allexport

# ── Step 4 — Docker Compose Down ──────────────────────────────
info "Step 3/5 → Stopping running containers (docker-compose down) ..."
$DC -f "$COMPOSE_FILE" down --remove-orphans
success "Containers stopped."
echo ""

# ── Step 5 — Docker Compose Build + Up ────────────────────────
info "Step 4/5 → Building image and starting containers ..."
$DC -f "$COMPOSE_FILE" build $NO_CACHE
$DC -f "$COMPOSE_FILE" up -d
success "Containers started."
echo ""

# ── Step 6 — Health check / log tail ──────────────────────────
info "Step 5/5 → Streaming logs for ${LOG_TAIL_SECONDS}s (Ctrl-C to stop) ..."
echo ""
timeout "$LOG_TAIL_SECONDS" $DC -f "$COMPOSE_FILE" logs --follow || true
echo ""

# ── Final status ───────────────────────────────────────────────
RUNNING=$($DC -f "$COMPOSE_FILE" ps --filter "status=running" --quiet | wc -l | tr -d ' ')

if [[ "$RUNNING" -gt 0 ]]; then
  success "Deployment complete! ${RUNNING} container(s) running."
  echo ""
  $DC -f "$COMPOSE_FILE" ps
else
  error "No running containers detected after deploy. Check: $DC logs"
fi

echo ""
echo -e "${BOLD}📖 Swagger docs:${RESET} http://\$(hostname -I | awk '{print \$1}'):${PORT:-3000}/api/documentation"
echo ""
