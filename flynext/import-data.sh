#!/bin/bash
# echo "creating migration"
# docker-compose exec app npx prisma migrate deploy
echo "seeding"
docker-compose exec app node  --env-file=.env --experimental-strip-types --no-deprecation scripts/seed-complete.ts

