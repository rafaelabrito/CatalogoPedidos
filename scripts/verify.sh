#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

run_step() {
  local message="$1"
  shift
  echo "[verify] ${message}"
  "$@"
  echo "[verify] Completed: ${message}"
}

if [[ "${SKIP_BACKEND_TESTS:-0}" != "1" ]]; then
  run_step "dotnet test (backend)" dotnet test "${REPO_ROOT}/backend/backend.sln" --nologo
fi

pushd "${REPO_ROOT}/frontend" >/dev/null
if [[ "${SKIP_FRONTEND_LINT:-0}" != "1" ]]; then
  run_step "npm run lint (frontend)" npm run lint -- --no-progress
fi

if [[ "${SKIP_FRONTEND_TESTS:-0}" != "1" ]]; then
  run_step "npm run test:ci (frontend)" npm run test:ci -- --no-progress
fi
popd >/dev/null

echo "[verify] All steps finished."
