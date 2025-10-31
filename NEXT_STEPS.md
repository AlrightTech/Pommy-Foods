# Next Steps After Vercel Connection

## ✅ Completed
- [x] Environment variables configured (.env.local)
- [x] Git repository updated
- [x] Vercel project connected

## 🔄 Next Steps

### 1. Verify Environment Variables in Vercel

Make sure you've added all environment variables in Vercel Dashboard:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add the following variables (use the same values from your `.env.local`):

   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-jwt-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000 (for dev) or https://your-domain.vercel.app (for prod)
   NODE_ENV=production
   UPLOAD_MAX_SIZE=10485760
   ```

   **Important:** 
   - Select **all environments** (Production, Preview, Development)
   - Use your Supabase connection string for production

### 2. Test Local Database Connection

Run these commands to verify your local setup:

```bash
# Generate Prisma Client (if not done)
npx prisma generate

# Test database connection
npx prisma db push

# Open Prisma Studio to verify
npx prisma studio
```

If you get "Environment variable not found" error:
- Make sure `.env.local` is in the project root
- Restart your terminal/IDE
- Try: `npx dotenv-cli -e .env.local -- prisma db push`

### 3. Run Initial Database Migration

**Option A: Using db push (Development - syncs schema directly)**
```bash
npx prisma db push
```

**Option B: Using migrations (Production - creates migration files)**
```bash
npx prisma migrate dev --name init
```

### 4. Seed Initial Admin User

After database is set up:

```bash
npm run db:seed
```

This creates:
- Email: `admin@pommyfoods.com`
- Password: `Admin@123`
- Role: `ADMIN`

**⚠️ Important:** Change this password immediately after first login!

### 5. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Login page loads
- Can login with admin credentials
- Admin dashboard works

### 6. Deploy to Vercel

**Automatic (via Git push):**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Vercel will automatically:
- Build the application
- Deploy to production
- Run postinstall script (generates Prisma Client)

**Manual deployment:**
```bash
vercel --prod
```

### 7. Run Database Migrations on Vercel

After first deployment, you need to run migrations on production:

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Pull production environment
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

**Option B: Via GitHub Actions**
- Go to GitHub → Actions
- Find "Prisma Migrate" workflow
- Click "Run workflow"

**Option C: Via Supabase SQL Editor**
- Go to Supabase Dashboard → SQL Editor
- Copy the SQL from your migration files
- Run the SQL manually

### 8. Verify Production Deployment

1. Check Vercel Dashboard → Deployments
2. Visit your production URL
3. Test login functionality
4. Check Vercel logs for any errors

## 🔧 Troubleshooting

### "Environment variable not found" Error

**Solution 1:** Verify `.env.local` exists in project root
```bash
ls .env.local  # or dir .env.local on Windows
```

**Solution 2:** Load env manually
```bash
# Install dotenv-cli
npm install -D dotenv-cli

# Use it to run commands
npx dotenv-cli -e .env.local -- prisma db push
```

**Solution 3:** Restart terminal/IDE after creating .env.local

### Database Connection Issues

1. Verify Supabase connection string is correct
2. Check if password is URL-encoded in connection string
3. Verify Supabase database is running
4. Check firewall/IP restrictions in Supabase settings

### Build Fails on Vercel

1. Check Vercel logs for specific errors
2. Verify all environment variables are set in Vercel
3. Ensure DATABASE_URL uses connection pooling for production
4. Check if Prisma Client generation is successful

### Migration Issues

- Use `db push` for development (direct sync)
- Use `migrate deploy` for production (runs migrations)
- Always backup database before running migrations in production

## 📋 Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] Initial admin user created
- [ ] Test login functionality
- [ ] Verify admin dashboard loads
- [ ] Check Vercel function logs for errors
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Generate new secrets for production (different from dev)
- [ ] Test all API endpoints
- [ ] Verify database connection pooling is enabled

## 🎉 Success!

Once all steps are complete:
- Your application is deployed to Vercel
- Database is configured with Supabase
- CI/CD pipeline is active
- Ready for development and production use!

