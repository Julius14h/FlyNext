#generated by grok

#!/bin/bash
set -e
cd "$(dirname "$0")/flynext" || exit 1
echo "Installing npm dependencies..."
npm install --silent
echo "Applying Prisma migrations..."
npx prisma migrate deploy
echo "Seeding AFS cities and airports..."
node  --env-file=.env --experimental-strip-types --no-deprecation scripts/seed-complete.ts