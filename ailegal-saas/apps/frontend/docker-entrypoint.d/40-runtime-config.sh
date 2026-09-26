#!/bin/sh
set -eu

printf 'window.__PBMAPP_CONFIG__ = { GOOGLE_CLIENT_ID: "%s", API_URL: "%s" };\n' "${VITE_GOOGLE_CLIENT_ID:-}" "${VITE_API_URL:-}" \
  > /usr/share/nginx/html/runtime-config.js
