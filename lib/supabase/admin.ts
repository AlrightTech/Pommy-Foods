import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client with service role key (server-side only)
// This should only be used in server components/API routes
export const getSupabaseAdmin = () => {
  // Read directly from process.env to ensure we get the latest value
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please set it in your .env.local file.');
  }

  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please set it in your .env.local file. You can find this key in your Supabase Dashboard → Settings → API → service_role key (secret).');
  }

  // Validate the key format (JWT tokens start with 'eyJ')
  if (!serviceKey.startsWith('eyJ')) {
    throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format. The service role key should be a JWT token starting with "eyJ". Please verify you copied the correct key from Supabase Dashboard → Settings → API → service_role key (secret).');
  }

  // Check key length (service role keys are typically 200+ characters)
  if (serviceKey.length < 100) {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY appears to be too short (${serviceKey.length} characters). Service role keys are typically 200+ characters. Please verify you copied the complete key.`);
  }

  try {
    return createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to create Supabase admin client: ${error.message}`);
  }
};

