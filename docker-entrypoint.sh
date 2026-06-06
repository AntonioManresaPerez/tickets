#!/bin/sh
set -e

# Aplica las migraciones pendientes antes de arrancar el servidor.
echo "→ Aplicando migraciones de base de datos..."
npx prisma migrate deploy

echo "→ Arrancando servidor Next.js..."
exec node server.js
