# Database Setup

This project uses [Drizzle ORM](https://orm.drizzle.team/) to manage the database schema against a Supabase PostgreSQL instance.

## Schema Definition

All table definitions live in [`shared/schema.ts`](./shared/schema.ts). This is the single source of truth for the database structure. After pulling code changes that modify this file, you must sync the schema to the database before running the application.

## Commands

### Apply schema changes to the database

```bash
npm run db:push
```

This runs `drizzle-kit push`, which introspects `shared/schema.ts` and applies any missing columns, tables, or indexes directly to the connected database. Use this for development or when you need to quickly sync schema changes without generating migration files.

> **Note:** You must have a valid `DATABASE_URL` (or equivalent Supabase connection string) set in your `.env` file before running this command.

### Generate migration files

```bash
npm run db:generate
```

This runs `drizzle-kit generate` and produces SQL migration files based on the diff between `shared/schema.ts` and the last known migration state. Use this when you want a versioned migration history to apply in staging or production environments.

### View and edit data

```bash
npm run db:studio
```

This runs `drizzle-kit studio` and opens a local web UI for browsing and editing database records.

## Troubleshooting

**Error: "Could not find the '&lt;column&gt;' column of '&lt;table&gt;' in the schema cache"**

This means the database table is missing a column that the application code expects. The schema in `shared/schema.ts` has been updated but the change has not been pushed to the database yet. Run:

```bash
npm run db:push
```

Then restart the application.
