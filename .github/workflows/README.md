# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing, building, and deployment.

## Workflows

### CI/CD Pipeline (ci-cd.yml)

Automated workflow that runs on every push and pull request:

- **Lint and Test**: Runs ESLint and TypeScript checks
- **Build**: Builds the application to verify it compiles
- **Deploy Preview**: Deploys to Vercel preview environment on pull requests
- **Deploy Production**: Deploys to Vercel production on pushes to main branch

### Prisma Migrate (prisma-migrate.yml)

Database migration workflow that runs:

- Automatically when `prisma/schema.prisma` changes on main branch
- Manually via workflow dispatch

## Setup

1. Add required secrets to GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

2. Workflows will automatically run on push/PR events

## Manual Triggers

To manually run the Prisma migrate workflow:

1. Go to Actions tab in GitHub
2. Select "Prisma Migrate"
3. Click "Run workflow"

