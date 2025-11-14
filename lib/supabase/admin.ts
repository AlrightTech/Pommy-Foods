import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client with service role key (server-side only)
// This should only be used in server components/API routes
export const getSupabaseAdmin = () => {
  // Read directly from process.env to ensure we get the latest value
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // Validate URL
  if (!url) {
    const error = new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please set it in your .env.local file.');
    (error as any).code = 'MISSING_URL';
    throw error;
  }

  // Validate URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const error = new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format. It should start with http:// or https://');
    (error as any).code = 'INVALID_URL';
    throw error;
  }

  // Validate service key exists
  if (!serviceKey) {
    const error = new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please set it in your .env.local file. You can find this key in your Supabase Dashboard → Settings → API → service_role key (secret).');
    (error as any).code = 'MISSING_SERVICE_KEY';
    throw error;
  }

  // Validate the key format (JWT tokens start with 'eyJ')
  if (!serviceKey.startsWith('eyJ')) {
    const error = new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format. The service role key should be a JWT token starting with "eyJ". Please verify you copied the correct key from Supabase Dashboard → Settings → API → service_role key (secret).');
    (error as any).code = 'INVALID_KEY_FORMAT';
    throw error;
  }

  // Check key length (service role keys are typically 200+ characters)
  if (serviceKey.length < 100) {
    const error = new Error(`SUPABASE_SERVICE_ROLE_KEY appears to be too short (${serviceKey.length} characters). Service role keys are typically 200+ characters. Please verify you copied the complete key.`);
    (error as any).code = 'KEY_TOO_SHORT';
    throw error;
  }

  try {
    const client = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return client;
  } catch (error: any) {
    const enhancedError = new Error(`Failed to create Supabase admin client: ${error.message}`);
    (enhancedError as any).code = 'CLIENT_CREATION_FAILED';
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
};

