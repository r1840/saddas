# Local DB setup (PostgreSQL)

1. Copy env file:

```bash
cp .env.local.example .env.local
```

2. Start local PostgreSQL:

```bash
docker compose up -d
```

3. Install deps:

```bash
pnpm install
```

4. Run app:

```bash
pnpm dev
```

The app will use `DATABASE_URL` for all server-side DB operations.
