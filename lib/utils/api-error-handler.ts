import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  hint?: string;
}

/**
 * Handles errors from getSupabaseAdmin() and returns appropriate HTTP responses
 */
export function handleSupabaseAdminError(error: any): NextResponse {
  const errorCode = error?.code || 'UNKNOWN_ERROR';
  const errorMessage = error?.message || 'Unknown error occurred';

  console.error('Supabase Admin Error:', {
    code: errorCode,
    message: errorMessage,
    details: error?.details,
  });

  // Map error codes to appropriate HTTP status codes and messages
  switch (errorCode) {
    case 'MISSING_URL':
    case 'MISSING_SERVICE_KEY':
      return NextResponse.json(
        {
          error: 'Configuration error',
          details: errorMessage,
          hint: 'Please check your .env.local file and ensure all required environment variables are set.',
          code: errorCode,
        },
        { status: 500 }
      );

    case 'INVALID_URL':
    case 'INVALID_KEY_FORMAT':
    case 'KEY_TOO_SHORT':
      return NextResponse.json(
        {
          error: 'Invalid configuration',
          details: errorMessage,
          hint: 'Please verify your Supabase credentials in .env.local file.',
          code: errorCode,
        },
        { status: 500 }
      );

    case 'CLIENT_CREATION_FAILED':
      return NextResponse.json(
        {
          error: 'Failed to initialize Supabase client',
          details: errorMessage,
          hint: 'Please check your Supabase credentials and network connection.',
          code: errorCode,
        },
        { status: 500 }
      );

    default:
      return NextResponse.json(
        {
          error: 'Server error',
          details: errorMessage,
          code: errorCode,
        },
        { status: 500 }
      );
  }
}

/**
 * Wraps getSupabaseAdmin() call with error handling
 */
export async function safeGetSupabaseAdmin(getSupabaseAdminFn: () => any) {
  try {
    return { client: getSupabaseAdminFn(), error: null };
  } catch (error: any) {
    return { client: null, error };
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  details?: any,
  hint?: string
): NextResponse {
  const message = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      ...(hint && { hint }),
    },
    { status }
  );
}



