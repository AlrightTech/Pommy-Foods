# Environment Variables Setup Guide

## Issue: "Invalid API key" Error

If you're seeing an "Invalid API key" error when creating products (or performing admin operations), it's likely because the `SUPABASE_SERVICE_ROLE_KEY` environment variable is missing or incorrect.

## Quick Fix

1. **Create or update `.env.local` file** in the root of your project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. **Get your Supabase keys:**
   - Go to your Supabase Dashboard: https://app.supabase.com
   - Select your project
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key (secret)** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret!**

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Important Notes

- ⚠️ **Never commit `.env.local` to version control** - it's already in `.gitignore`
- The `SUPABASE_SERVICE_ROLE_KEY` is a **secret key** that bypasses Row Level Security (RLS)
- Only use the service role key in **server-side code** (API routes, server components)
- The service role key should **never** be exposed to the client

## Verification

After setting up your environment variables, you can verify they're loaded correctly by:

1. Checking the server console when starting the dev server
2. Trying to create a product - if the error persists, check:
   - The key is copied correctly (no extra spaces, complete key)
   - The `.env.local` file is in the project root
   - You've restarted the dev server after adding the variables

## Troubleshooting

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
- **Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file

### Error: "Invalid API key" or "JWT" errors
- **Solution**: Verify the service role key is correct and complete
- Make sure you're using the **service_role** key, not the **anon** key
- Check for any extra spaces or line breaks in the key

### Error persists after setting variables
- Restart your dev server completely
- Clear Next.js cache: `rm -rf .next` (or delete `.next` folder)
- Verify the `.env.local` file is in the project root (same level as `package.json`)


