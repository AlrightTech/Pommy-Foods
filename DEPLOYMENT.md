# Deployment Guide - Pommy Foods

This guide covers deploying the Pommy Foods application to Vercel with CI/CD pipeline.

## Prerequisites

1. **GitHub Account** - For version control and CI/CD
2. **Vercel Account** - For hosting
3. **Database** - PostgreSQL database (Vercel Postgres, Supabase, or any PostgreSQL provider)
4. **Node.js 20+** - For local development

## Initial Setup

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js framework

### 2. Configure Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-minimum-32-characters
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
UPLOAD_MAX_SIZE=10485760
```

**Important:** Use strong, random secrets in production (minimum 32 characters)

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

- `VERCEL_TOKEN` - Get from Vercel Dashboard → Settings → Tokens
- `VERCEL_ORG_ID` - Get from Vercel Dashboard → Settings → General
- `VERCEL_PROJECT_ID` - Get from Vercel project settings
- `DATABASE_URL` - Your production database URL
- `JWT_SECRET` - Same as Vercel environment variable
- `NEXTAUTH_SECRET` - Same as Vercel environment variable
- `NEXTAUTH_URL` - Your production URL

## Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

- **Build Command**: Automatically runs Prisma generate and Next.js build
- **Regions**: Configured for optimal performance
- **Environment Variables**: Pre-configured for easy setup

## Database Setup

### Using Vercel Postgres (Recommended)

1. In Vercel Dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

### Using External PostgreSQL

1. Create database with your provider
2. Get connection string
3. Add as `DATABASE_URL` environment variable

### Run Initial Migration

After deploying, run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or via GitHub Actions workflow
# Go to Actions → Prisma Migrate → Run workflow
```

## CI/CD Pipeline

### Automatic Workflows

1. **On Pull Request**
   - Runs linting and type checking
   - Builds application
   - Deploys to Vercel Preview

2. **On Push to Main**
   - Runs full CI checks
   - Deploys to Production
   - Creates preview deployment

3. **On Schema Changes**
   - Automatically runs Prisma migrations (if workflow enabled)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Build Configuration

The `package.json` includes:

- **postinstall**: Automatically generates Prisma Client after npm install
- **vercel-build**: Custom build command for Vercel deployments
- **build**: Standard build with Prisma generation

## Environment Variables

### Development (.env.local)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pommy_foods"
JWT_SECRET="development-secret-key"
NEXTAUTH_SECRET="development-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Production (Vercel Environment Variables)

Set these in Vercel Dashboard → Project Settings → Environment Variables

## Post-Deployment Steps

1. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Create Initial Admin User**
   - Use Prisma Studio: `npx prisma studio`
   - Or create via API/seed script

3. **Verify Deployment**
   - Check all environment variables are set
   - Test authentication flow
   - Verify database connections

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Logs**: Available in Vercel Dashboard → Deployments → Logs
- **Database**: Monitor connection pool and query performance

## Troubleshooting

### Build Fails

- Check environment variables are set correctly
- Verify DATABASE_URL is accessible
- Check Prisma Client is generating: `npx prisma generate`

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### Authentication Issues

- Verify JWT_SECRET and NEXTAUTH_SECRET are set
- Check NEXTAUTH_URL matches your domain
- Ensure cookies are working (check HTTPS)

## Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

## Performance Optimization

- **Edge Functions**: Automatically enabled for API routes
- **Image Optimization**: Next.js Image component optimized
- **Static Assets**: Automatically cached via CDN

## Security Checklist

- [ ] Use strong, unique secrets (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Use environment variables for all secrets
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities

## Support

For issues or questions:
- Check Vercel [Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check Prisma [Deployment Guide](https://www.prisma.io/docs/guides/deployment)

