npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npx prisma generate
