# Plans Tracker Backend (Fastify)

This is the rewritten backend for Plans Tracker using Fastify, Prisma, and Zod.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

3. Configure Environment:
   Ensure `.env` file is present (copied from `backend`, verify values).

## Development

Run the development server:

```bash
npm run dev
```

## Build

Build for production:

```bash
npm run build
```

## Structure

- `src/app.ts`: Main application entry configuration.
- `src/server.ts`: Server entry point.
- `src/plugins`: Fastify plugins (Prisma, Auth, Sensible).
- `src/modules`: Feature modules (Lists, Families, Settings, etc.).
- `src/common`: Shared utilities and decorators.

## API Documentation

Swagger UI is available at `/documentation`.
