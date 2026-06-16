# InsureTrac By Casurance

An AI-powered insurance management portal for Casurance Insurance Agency.

## Overview

InsureTrac is a comprehensive platform for managing insurance renewals, submissions, clients, leads, and carrier relationships. Built with Next.js 14, React Server Components, and Supabase, it provides a modern interface for insurance agency operations with QQCatalyst integration.

## Features

- **Renewals Management**: Track policy renewals with CSV/Excel import support
- **Submissions Tracking**: Manage new business submissions workflow
- **Client Management**: Comprehensive customer records with QQCatalyst sync
- **Lead Tracking**: Lead generation and follow-up system
- **Call Logs**: Track customer interactions and communications
- **Service Requests**: Handle customer service inquiries
- **Carrier Contacts**: Manage insurance carrier relationships
- **Role-Based Access**: Admin, Agent, and User permission levels
- **QQCatalyst Integration**: Real-time sync with insurance management system
- **Automated Tracking Numbers**: Unique identifiers for all entities (CALL-, LEAD-, TSK-, RNW-, SUB-, REQ-, CAR-, CLI-)

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Server Actions
- **Authentication**: Supabase Auth with role-based access control
- **UI Components**: Shadcn/ui, Radix UI
- **Integrations**: QQCatalyst API

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Supabase account with PostgreSQL database

### Environment Variables

Required secrets (managed through Replit Secrets):
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `QQ_CLIENT_ID`: QQCatalyst API client ID
- `QQ_CLIENT_SECRET`: QQCatalyst API client secret
- `QQ_USERNAME`: QQCatalyst username
- `QQ_PASSWORD`: QQCatalyst password

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

The application will be available at `http://localhost:5000`

### Database Setup

```bash
# Push schema changes to database
npm run db:push

# Force push if needed (use with caution)
npm run db:push --force
```

## Project Structure

```
├── app/                    # Next.js App Router pages and layouts
│   ├── actions/           # Server actions for data mutations
│   ├── admin/             # Admin dashboard and user management
│   ├── api/               # API routes
│   ├── leads/             # Lead management
│   ├── renewals/          # Renewals tracking and import
│   ├── submissions/       # Submissions workflow
│   └── ...
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── ...
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client setup
│   └── ...
├── shared/               # Shared schemas and types
│   └── schema.ts         # Drizzle ORM schema
└── public/               # Static assets and templates
    └── templates/        # CSV import templates
```

## Key Features

### CSV/Excel Import
Import renewals from QQCatalyst exports at `/renewals/import` with intelligent field mapping:
- Customer information and contact details
- Policy numbers and coverage types
- Premium and commission amounts
- Effective and expiration dates
- Agent assignments

### Tracking Numbers
All entities receive unique tracking numbers for easy reference:
- Renewals: `RNW-{timestamp}-{random}`
- Leads: `LEAD-{timestamp}-{random}`
- Tasks: `TSK-{timestamp}-{random}`
- Submissions: `SUB-{timestamp}-{random}`
- Service Requests: `REQ-{timestamp}-{random}`
- Call Logs: `CALL-{timestamp}-{random}`
- Carrier Contacts: `CAR-{timestamp}-{random}`
- Clients: `CLI-{timestamp}-{random}`

### QQCatalyst Integration
Real-time synchronization with QQCatalyst insurance management system:
- Policy data sync
- Client information updates
- Document management
- Contact synchronization

## Development

### Adding Database Tables

1. Update the schema in `shared/schema.ts`
2. Run `npm run db:push` to sync with database
3. Update corresponding server actions in `app/actions/`

### Creating New Pages

Follow Next.js 14 App Router conventions:
- Server Components by default
- Use `"use client"` directive for client-side interactivity
- Server Actions for data mutations

## License

Proprietary - Casurance Insurance Agency
