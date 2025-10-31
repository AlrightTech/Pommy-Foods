# Quick Vercel Setup Guide

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Next.js

## Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Random 32+ character string |
| `NEXTAUTH_SECRET` | Random 32+ character string |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `NODE_ENV` | `production` |

## Step 4: Get Vercel Credentials for GitHub Actions

1. **VERCEL_TOKEN**: 
   - Vercel Dashboard → Settings → Tokens
   - Create new token → Copy

2. **VERCEL_ORG_ID**:
   - Vercel Dashboard → Settings → General
   - Copy "Team ID" or "User ID"

3. **VERCEL_PROJECT_ID**:
   - Project Settings → General
   - Copy "Project ID"

## Step 5: Add GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions:

Add all secrets from Step 4 plus:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Step 6: Deploy

1. Push to main branch triggers automatic deployment
2. Or deploy manually: `vercel --prod`

## Step 7: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

## Step 8: Create Admin User

```bash
npm run db:seed
```

Or manually via Prisma Studio:
```bash
npx prisma studio
```

## Troubleshooting

### Build fails with Prisma error
- Ensure `DATABASE_URL` is set correctly
- Check database is accessible
- Run `npx prisma generate` locally first

### 500 errors after deployment
- Check all environment variables are set
- Verify database migrations ran
- Check Vercel function logs

### Authentication not working
- Verify `JWT_SECRET` and `NEXTAUTH_SECRET` match
- Check `NEXTAUTH_URL` matches your domain
- Ensure cookies are enabled

