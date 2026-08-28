#!/bin/sh
set -eu

printf 'window.__PBMAPP_CONFIG__ = { GOOGLE_CLIENT_ID: "%s" };\n' "${VITE_GOOGLE_CLIENT_ID:-}" \
  > /usr/share/nginx/html/runtime-config.js
