# Deployment Guide - Pommy Foods

This guide covers setting up CI/CD pipelines and deploying the Pommy Foods application to Vercel with Supabase as the database.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account
- Node.js 18+ installed locally

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `pommy-foods`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 1.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 1.3 Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Using Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/20240315000000_initial_schema.sql`
3. Paste and run in SQL Editor
4. Repeat for `supabase/migrations/20240315000001_rls_policies.sql`

### 1.4 Set Up Authentication

1. Go to Authentication → Settings
2. Configure Site URL: `https://your-vercel-app.vercel.app`
3. Add Redirect URLs:
   - `https://your-vercel-app.vercel.app/**`
   - `http://localhost:3000/**` (for local development)

## Step 2: Vercel Setup

### 2.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 2.2 Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

**Important**: 
- Add these to **Production**, **Preview**, and **Development** environments
- `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will automatically:
   - Install dependencies
   - Build the project
   - Deploy to production

## Step 3: GitHub Actions Setup

### 3.1 Get Vercel Tokens

1. Go to Vercel → Settings → Tokens
2. Create a new token
3. Copy the token

### 3.2 Get Vercel Project IDs

1. Go to your project in Vercel
2. Go to Settings → General
3. Copy:
   - **Project ID**
   - **Organization ID**

### 3.3 Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_organization_id
VERCEL_PROJECT_ID=your_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_ID=your_supabase_project_id
SUPABASE_DB_PASSWORD=your_database_password
```

### 3.4 Get Supabase Access Token

1. Go to Supabase Dashboard → Account Settings → Access Tokens
2. Generate a new token
3. Add to GitHub Secrets as `SUPABASE_ACCESS_TOKEN`

## Step 4: Verify Deployment

### 4.1 Check CI/CD Pipeline

1. Push a commit to `main` branch
2. Go to GitHub → Actions
3. Verify the pipeline runs successfully:
   - Lint and Test
   - Build
   - Deploy to Vercel

### 4.2 Test the Application

1. Visit your Vercel deployment URL
2. Verify the admin dashboard loads
3. Check browser console for errors
4. Test database connection (if auth is implemented)

## Step 5: Database Migrations

### 5.1 Local Development

```bash
# Start Supabase locally
supabase start

# Run migrations
supabase db push

# Stop Supabase
supabase stop
```

### 5.2 Production Migrations

Migrations run automatically via GitHub Actions when you push to `main` branch and modify files in `supabase/migrations/`.

To manually run migrations:

```bash
# Link to production project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | - |

## Troubleshooting

### Build Failures

1. **Missing Environment Variables**
   - Check Vercel environment variables are set
   - Verify variable names match exactly

2. **TypeScript Errors**
   - Run `npm run build` locally
   - Fix any TypeScript errors before pushing

3. **Supabase Connection Errors**
   - Verify Supabase URL and keys are correct
   - Check Supabase project is active
   - Verify RLS policies allow access

### Database Migration Issues

1. **Migration Conflicts**
   - Check migration file names are unique
   - Verify migration SQL syntax is correct
   - Review Supabase logs for errors

2. **RLS Policy Errors**
   - Verify user authentication is working
   - Check RLS policies match your use case
   - Test policies in Supabase SQL Editor

### Deployment Issues

1. **Vercel Deployment Fails**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in `package.json`
   - Check for environment variable errors

2. **GitHub Actions Failures**
   - Verify all secrets are set correctly
   - Check workflow file syntax
   - Review action logs for specific errors

## Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` as template
   - Rotate secrets regularly

2. **Database Migrations**
   - Always test migrations locally first
   - Use descriptive migration file names
   - Keep migrations small and focused

3. **CI/CD**
   - Test locally before pushing
   - Use feature branches for development
   - Review PRs before merging to main

4. **Security**
   - Keep `SUPABASE_SERVICE_ROLE_KEY` secret
   - Use RLS policies for data access
   - Regularly update dependencies

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### Supabase Monitoring

1. Monitor in Supabase Dashboard:
   - Database performance
   - API usage
   - Authentication metrics

## Support

For issues or questions:
- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Supabase Documentation](https://supabase.com/docs)
- Review project README.md

