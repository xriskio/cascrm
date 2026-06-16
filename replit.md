# InsureTrac by Casurance - Project Documentation

## Overview
InsureTrac is an AI-powered insurance management portal designed for Casurance Insurance Agency. It optimizes insurance operations by managing renewals, submissions, clients, leads, and carrier relationships. The platform integrates with QQCatalyst for policy and client data synchronization, offering a modern interface to enhance agency workflows, automate processes, and boost operational efficiency. It focuses on real-time updates and is built with Next.js 14 (App Router), React Server Components, and Supabase.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Rendering:** Next.js 14 with App Router and React Server Components (RSC) for server-side rendering and client-side hydration, using TypeScript.
- **UI/UX:** Shadcn/ui component library built on Radix UI, styled with Tailwind CSS, including custom design tokens and a dark theme (`#080B12` bg, `#0F1320` surfaces, electric blue/indigo accents). Features responsive design.
- **State Management & Data Flow:** Utilizes Server Actions for data mutations and fetching, React Context for global state (Auth, Notifications, Realtime), and custom hooks for reusable logic. Forms are handled with React Hook Form and Zod validation.
- **Routing & Navigation:** File-based routing via Next.js App Router, with middleware for Supabase SSR-based authentication and role-based access control.

### Backend Architecture
- **Database:** Supabase (PostgreSQL) with Row Level Security (RLS) and a service role client for administrative operations. Includes audit logging for data changes.
- **Authentication & Authorization:** Supabase Auth handles email/password authentication, role-based access control (admin, agent, user), and granular permissions. Cookie-based session management is via `@supabase/ssr`.
- **API Design:** Employs Server Actions for type-safe client-server communication and RESTful API routes for external integrations, with middleware authentication on protected routes.
- **Data Processing:** Supports batch processing for large data imports, flexible field mapping, duplicate detection, data cleanup, date normalization, and generates unique tracking numbers for all entities.

### Feature Specifications
- **Renewal Management:** Allows import from QQCatalyst by date range, named insured, or policy/account number. Includes an archive feature for bound renewals.
- **Client Management:** Enhanced client import from QQCatalyst automatically fetches and attaches comprehensive policy information to client records.
- **Market Submissions Tracking:** Tracks broker submissions to markets and wholesalers, including wholesaler contact information, quote status (pending, quoted, declined, bound, expired), market/carrier names, submission/response dates, and quote amounts.
- **Submissions Tracking:** Features a professional table view for tracking applications, including document upload capabilities (Acord, Garage, Vintage, Other Documents) to a Supabase Storage `documents` bucket, and detailed application views. Includes smart file parsing for auto-populating forms from CSV, Excel, or PDF files with intelligent field mapping.
- **Missing Documents Tracking:** Manages outstanding document requests with tracking numbers, status updates, automated bulk reminders via email, and priority levels.
- **User Management (Admin-Only):** Full CRUD operations for user accounts with role-based permissions (admin, agent, user).
- **Settings & Profile Management:** Centralized settings hub with navigation to profile tabs for personal information, security, notification preferences, company information, business hours, and websites.
- **Reports & Analytics:** Comprehensive reporting system with real-time statistics dashboard. Features include dynamic KPI cards, date range filtering, CSV data export, and percentage change tracking. Report categories cover submissions, clients, and policies with detailed analytics.

## External Dependencies

-   **Supabase:** Primary Backend-as-a-Service for PostgreSQL database, authentication, real-time subscriptions, and storage. Integrated with server and client SDKs (`@supabase/ssr`).
-   **QQCatalyst API:** Insurance management system integration via REST API with OAuth 2.0. Used for syncing policies, renewals, clients, and contacts.
-   **Resend:** Email delivery service for transactional emails, used for submission notifications and document reminders.
-   **Replit:** Hosting and development environment, used for secret management, workflow automation, and application hosting.