import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a function to get the Supabase client
// This ensures we always read the latest environment variables
function createSupabaseClient(): SupabaseClient {
  // Read environment variables directly (not cached)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('❌ Missing Supabase environment variables!');
      console.error('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
      console.error('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
      console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
      console.error('Then restart your Next.js dev server!');
    }
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Create client - Supabase automatically adds apikey header
  // The apikey header is added automatically when you pass the anon key
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
    db: {
      schema: 'public',
    },
  });

  // Verify client is properly configured (client-side only)
  if (typeof window !== 'undefined') {
    console.log('✅ Supabase client initialized');
    console.log('URL:', supabaseUrl.substring(0, 30) + '...');
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
  }

  return client;
}

// Create singleton instance
let supabase: SupabaseClient;

// Initialize client
try {
  supabase = createSupabaseClient();
} catch (error) {
  // Fallback for build time - will throw error at runtime if used without proper config
  console.warn('⚠️ Using placeholder Supabase client. Set environment variables for production.');
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}

export { supabase };

