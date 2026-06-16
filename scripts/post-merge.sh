#!/bin/bash
# Post-merge hook: install dependencies then push a clean snapshot to GitHub.
#
# WHY ORPHAN STRATEGY FOR GITHUB PUSH:
# Replit's internal git uses a filtered/shallow clone. The local repo's commit
# history references blob/tree objects that were never fetched locally, so a
# regular `git push --force` always fails at GitHub's unpack stage with
# "did not receive expected object". An orphan commit avoids shared history
# entirely and pushes cleanly.
#
# Each push is a full-tree snapshot, so GitHub always has the latest code.
# Commit history is preserved inside Replit's own checkpoint system.

set -euo pipefail

# ── 1. Install dependencies ──────────────────────────────────────────────────
pnpm install

# ── 2. Push snapshot to GitHub ───────────────────────────────────────────────
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "GITHUB_TOKEN not set — skipping GitHub push."
  exit 0
fi

GITHUB_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/xriskio/cascrm.git"
ORIG_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
SYNC_BRANCH="_github_sync_$$"

# Always restore original HEAD and delete the sync branch, even on failure.
cleanup() {
  local exit_code=$?
  git symbolic-ref HEAD "refs/heads/${ORIG_BRANCH}" 2>/dev/null || true
  rm -f .git/index.lock 2>/dev/null || true
  git branch -D "${SYNC_BRANCH}" 2>/dev/null || true
  exit "$exit_code"
}
trap cleanup EXIT

git config user.email "replit-sync@casurance.com"
git config user.name "Replit Sync"

echo "Creating snapshot branch '${SYNC_BRANCH}'..."
git checkout --orphan "${SYNC_BRANCH}"

# Stage all git-tracked and newly added files (respects .gitignore).
git add --all

git commit -m "Sync from Replit - $(date -u +%Y-%m-%dT%H:%M:%SZ)" --allow-empty

echo "Pushing snapshot to GitHub..."
GIT_LFS_SKIP_PUSH=1 git push --no-thin "${GITHUB_URL}" "HEAD:refs/heads/main" --force

echo "GitHub sync complete."
# cleanup() runs on EXIT and restores the original branch
