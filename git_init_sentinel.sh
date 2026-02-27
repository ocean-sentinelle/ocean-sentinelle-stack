#!/usr/bin/env bash
set -euo pipefail

if [ -d .git ]; then
  echo ".git already exists; nothing to initialize"
  exit 0
fi

# Ensure README exists (non-destructive; if you want to regenerate, run save_readme.sh before)
if [ ! -f README.md ]; then
  echo "README.md not found; aborting" >&2
  exit 1
fi

git init

# Prefer 'main' if supported
if git branch -M main >/dev/null 2>&1; then
  :
else
  git checkout -b main
fi

# Set local identity if not configured
if ! git config --get user.name >/dev/null; then
  git config user.name "Ocean Sentinel"
fi
if ! git config --get user.email >/dev/null; then
  git config user.email "admin@oceansentinelle.fr"
fi

# Create or update .gitignore (append-only)
if [ ! -f .gitignore ]; then
  : > .gitignore
fi

append_ignore() {
  local pattern="$1"
  if ! grep -qxF "$pattern" .gitignore; then
    printf '%s\n' "$pattern" >> .gitignore
  fi
}

append_ignore ".env"
append_ignore ".env.*"
append_ignore "node_modules/"
append_ignore "dist/"
append_ignore "__pycache__/"
append_ignore "*.pyc"
append_ignore ".DS_Store"
append_ignore "runtime/"
append_ignore "pg_data/"

git add -A

git commit -m "chore: initial commit"

echo "Git repository initialized on branch: $(git branch --show-current)"
