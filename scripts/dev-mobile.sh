#!/usr/bin/env bash
# Serve the dev site over HTTPS on the local network so phones can use the camera.
# Makes a self-signed certificate for this machine's LAN address (no sudo needed);
# the phone shows a certificate warning once. API calls go through Next.js
# (/api/v1 -> BACKEND_URL), so the phone only needs this one address.
set -euo pipefail
cd "$(dirname "$0")/.."

IP="${LAN_IP:-$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i < NF; i++) if ($i == "src") print $(i + 1)}')}"
IP="${IP:-$(ipconfig getifaddr en0 2>/dev/null || true)}"  # macOS
[ -n "$IP" ] || { echo "Could not find the LAN IP; set LAN_IP=192.168.x.x" >&2; exit 1; }

mkdir -p certificates
CERT=certificates/dev-$IP.pem KEY=certificates/dev-$IP-key.pem
if [ ! -f "$CERT" ]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 365 -subj "/CN=$IP" \
    -addext "subjectAltName=IP:$IP,IP:127.0.0.1,DNS:localhost" -keyout "$KEY" -out "$CERT" 2>/dev/null
fi

PORT_ARG="${PORT:-3000}"
args=("$@")
for i in "${!args[@]}"; do
  case "${args[$i]}" in -p | --port) PORT_ARG="${args[$((i + 1))]:-$PORT_ARG}" ;; esac
done
echo "Open https://$IP:$PORT_ARG on your phone (same Wi-Fi) and accept the certificate warning."
NEXT_PUBLIC_API_URL= exec npx next dev --hostname 0.0.0.0 --experimental-https \
  --experimental-https-key "$KEY" --experimental-https-cert "$CERT" "$@"
