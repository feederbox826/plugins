#!/bin/sh
set -e

# s6-helper: stash-s6 plugin
# MIT	© feederbox826

# feederbox826 | MIT or AGPL3 | https://u.feederbox.cc/stash-log | v1.0
APP_NAME="s6-helper"
log() { level="$1"; shift; printf >&2 "\001%s\002%s: %s\n" "$level" "$APP_NAME" "$*"; }
log_proxy() { while IFS= read -r line; do log "$1" "$line"; done }

install() {
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
}

print_log() {
  LOG_FILE="/config/stash-s6.log"
  while IFS="" read -r p || [ -n "$p" ]
  do
    log "i" "$p"
  done < $LOG_FILE
}

MODE=$1

if [ -z "$MODE" ]; then
  log "e" "No mode specified. Usage: s6-helper.sh <install>"
  exit 1
elif [ "$MODE" = "install" ]; then
  install
elif [ "$MODE" = "print_log" ]; then
  print_log
else
  log "e" "Unknown mode: $MODE. Supported modes: install"
  exit 1
fi