#!/bin/sh
set -e

# s6-helper: stash-s6 dependency reinstaller
# MIT	© feederbox826

# feederbox826 | MIT or AGPL3 | https://u.feederbox.cc/stash-log | v1.0
APP_NAME="s6-helper"
log() { level="$1"; shift; printf >&2 "\001%s\002%s: %s\n" "$level" "$APP_NAME" "$*"; }
log_proxy() { while IFS= read -r line; do log "$1" "$line"; done }

[ -z "$UV_TARGET" ] && { log "e" "UV_TARGET not set. Please set it to the target directory."; exit 1; }

# delete existing dependencies
# clear cache
uv cache clean 2>&1 | log_proxy "d"
# clean dependencies
rm -rf "${UV_TARGET:?}"/*
log "d" "Cleared existing dependencies in $UV_TARGET"

# reinstall dependencies
uv pip install --system --target "$UV_TARGET" -r /config/requirements.txt 2>&1 | log_proxy "d"
log "i" "Reinstalled dependencies"