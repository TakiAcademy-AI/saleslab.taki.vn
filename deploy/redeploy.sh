#!/usr/bin/env bash
# Rebuild and restart TAKI Sales Lab on the VPS.
#
# Deployed copy lives at /opt/saleslab/redeploy.sh. Sync source first:
#   rsync -az --delete --exclude node_modules --exclude .next --exclude .git \
#     --exclude data --exclude '*.sqlite*' --exclude .env.runtime \
#     ./ root@<host>:/opt/saleslab/
#
# Resource caps matter: this box also serves several other sites, and an
# unbounded Next.js + native-module build has starved a host before.
set -euo pipefail
cd /opt/saleslab
nice -n 10 docker build --memory=2g --memory-swap=3g --cpu-shares=512 -t saleslab:latest .
docker rm -f saleslab >/dev/null 2>&1 || true
docker run -d --name saleslab --restart unless-stopped \
  --env-file /opt/saleslab/.env.runtime \
  -v saleslab-data:/data -v saleslab-codex:/codex \
  -p 127.0.0.1:3400:3000 \
  --memory=900m --cpus=1.0 \
  saleslab:latest
sleep 6
curl -fsS -o /dev/null http://127.0.0.1:3400/ && echo "saleslab: OK" || { echo "saleslab: FAILED"; docker logs --tail 40 saleslab; exit 1; }
