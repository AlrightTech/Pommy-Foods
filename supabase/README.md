# Supabase Database Setup

This directory contains Supabase configuration and database migrations for the Pommy Foods application.

## Structure

```
supabase/
├── config.toml          # Local development configuration
├── migrations/          # Database migration files
│   ├── 20240315000000_initial_schema.sql
│   └── 20240315000001_rls_policies.sql
└── README.md           # This file
```

## Local Development

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

### Start Local Supabase

```bash
# Start Supabase locally
supabase start

# This will output:
# - API URL: http://localhost:54321
# - GraphQL URL: http://localhost:54321/graphql/v1
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Inbucket URL: http://localhost:54324
```

### Run Migrations Locally

```bash
# Apply all migrations
supabase db reset

# Or apply specific migration
supabase migration up
```

### Stop Local Supabase

```bash
supabase stop
```

## Production Setup

### Link to Production Project

```bash
# Get your project reference from Supabase Dashboard
supabase link --project-ref your-project-ref
```

### Push Migrations to Production

```bash
# Push all migrations
supabase db push

# Or use GitHub Actions workflow (recommended)
# Migrations run automatically on push to main branch
```

## Migration Files

### 20240315000000_initial_schema.sql

Creates the initial database schema including:
- Stores table
- Products table
- Orders and order items
- Store stock levels
- Deliveries and returns
- Payments and invoices
- User profiles
- Kitchen sheets
- Indexes and triggers

### 20240315000001_rls_policies.sql

Sets up Row Level Security (RLS) policies for:
- Store owners can only access their own data
- Admins can access all data
- Drivers can update their assigned deliveries
- Proper access control for all tables

## Database Schema Overview

### Core Tables

- **stores**: Convenience stores and restaurants
- **products**: Product catalog
- **orders**: Customer orders
- **order_items**: Items in each order
- **store_stock**: Current stock levels per store

### Delivery & Returns

- **deliveries**: Delivery tracking
- **returns**: Expired/unsold item returns

### Financial

- **payments**: Payment records
- **invoices**: Generated invoices

### Users & Access

- **user_profiles**: Extended user information
- **kitchen_sheets**: Kitchen preparation tracking

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow admins full access
- Restrict store owners to their own store data
- Allow drivers to update their assigned deliveries
- Prevent unauthorized access

## Adding New Migrations

1. Create a new migration file:
```bash
supabase migration new migration_name
```

2. Edit the generated SQL file in `supabase/migrations/`

3. Test locally:
```bash
supabase db reset
```

4. Commit and push to trigger automatic deployment

## Backup & Restore

### Backup Production Database

```bash
supabase db dump --project-ref your-project-ref > backup.sql
```

### Restore from Backup

```bash
supabase db restore --project-ref your-project-ref backup.sql
```

## Useful Commands

```bash
# View migration status
supabase migration list

# Generate TypeScript types from database
supabase gen types typescript --local > types/database.types.ts

# Open Supabase Studio
supabase studio
```

## Troubleshooting

### Migration Errors

1. Check SQL syntax in migration file
2. Verify migration file name is unique
3. Review Supabase logs for specific errors

### RLS Policy Issues

1. Test policies in Supabase SQL Editor
2. Verify user authentication is working
3. Check user roles in `user_profiles` table

### Connection Issues

1. Verify Supabase project is active
2. Check environment variables are correct
3. Verify network access to Supabase

