# Debugging 500 Error on /api/admin/products

## Issue
The `/api/admin/products` endpoint is returning a 500 error when trying to fetch products.

## Fixes Applied

### 1. Added Error Handling to GET Handler
- Added the same comprehensive error handling to the GET handler that was in the POST handler
- Catches configuration errors early (missing/invalid service role key)
- Provides specific error messages for authentication issues

### 2. Improved Low Stock Query Error Handling
- Added error handling for the low stock filter query
- If the stock query fails, the endpoint will still return products (without the low stock filter)

### 3. Created Diagnostic Endpoint
- New endpoint: `/api/admin/test-connection`
- Tests Supabase connection and environment variables
- Provides detailed error information

## How to Debug

### Step 1: Check Server Console Logs
Look at your terminal where `npm run dev` is running. You should see detailed error messages like:
- "Supabase admin client error: ..."
- "Supabase error fetching products: ..."
- "Error fetching products: ..."

### Step 2: Test the Connection
Visit this URL in your browser or use curl:
```
http://localhost:3000/api/admin/test-connection
```

This will show you:
- Whether environment variables are set
- If the Supabase client can be created
- If a simple query works
- Detailed error information

### Step 3: Check Environment Variables
Verify your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Restart the Server
After checking/changing environment variables:
1. Stop the server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try accessing the products page again

## Common Issues and Solutions

### Issue: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### Issue: "Invalid API key" or "JWT" errors
**Solution**: 
- Verify the service role key is complete (should be ~200+ characters)
- Make sure you're using the **service_role** key, not the **anon** key
- Check for extra spaces or line breaks

### Issue: "Failed to fetch products" with no details
**Solution**: 
- Check the server console for the actual error
- Visit `/api/admin/test-connection` for diagnostics
- The error should now be logged with more details

### Issue: Table doesn't exist
**Solution**: 
- Run your database migrations
- Verify the `products` table exists in Supabase

## Next Steps

1. **Check the server console** - Look for the detailed error message
2. **Visit `/api/admin/test-connection`** - See what the diagnostic endpoint reports
3. **Share the error details** - The new error handling should provide more specific information about what's failing

The improved error handling will now show you exactly what's wrong, whether it's:
- Missing environment variable
- Invalid service role key
- Database connection issue
- Table/query problem

