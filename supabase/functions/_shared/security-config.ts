// Centralized security configuration for Edge Functions

// Environment-aware CORS configuration
export function getCorsHeaders(req?: Request): Record<string, string> {
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  const siteUrl = Deno.env.get('SITE_URL');
  
  // In production, use specific allowed origins
  const allowedOrigins = isProduction && siteUrl
    ? [siteUrl, `https://${siteUrl.replace(/^https?:\/\//, '')}`]
    : ['http://localhost:5173', 'http://localhost:3000']; // Development fallback
  
  // Get request origin
  const origin = req?.headers.get('origin');
  
  // Determine allowed origin
  let allowedOrigin = '*';
  if (isProduction && origin) {
    allowedOrigin = allowedOrigins.includes(origin) ? origin : 'null';
  } else if (!isProduction) {
    allowedOrigin = '*'; // Allow all in development
  }
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin',
  };
}

// Content Security Policy headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

// Combined headers for responses
export function getResponseHeaders(req?: Request): Record<string, string> {
  return {
    ...getCorsHeaders(req),
    ...getSecurityHeaders(),
    'Content-Type': 'application/json',
  };
}

// Validate request origin against allowed origins
export function validateOrigin(req: Request): boolean {
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  
  if (!isProduction) {
    return true; // Allow all in development
  }
  
  const origin = req.headers.get('origin');
  const siteUrl = Deno.env.get('SITE_URL');
  
  if (!origin || !siteUrl) {
    return false;
  }
  
  const allowedOrigins = [siteUrl, `https://${siteUrl.replace(/^https?:\/\//, '')}`];
  return allowedOrigins.includes(origin);
}

// Request method validation
export function validateMethod(req: Request, allowedMethods: string[]): boolean {
  return allowedMethods.includes(req.method);
}

// Handle preflight requests
export function handlePreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(req),
    });
  }
  return null;
}

// Create standardized error response
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 500,
  req?: Request
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: getResponseHeaders(req),
    }
  );
}

// Security middleware wrapper
export function withSecurity(
  handler: (req: Request) => Promise<Response>,
  options: {
    allowedMethods?: string[];
    requireValidOrigin?: boolean;
    rateLimiter?: any;
  } = {}
) {
  return async (req: Request): Promise<Response> => {
    const {
      allowedMethods = ['POST', 'OPTIONS'],
      requireValidOrigin = false,
      rateLimiter = null,
    } = options;
    
    // Handle preflight requests
    const preflightResponse = handlePreflightRequest(req);
    if (preflightResponse) {
      return preflightResponse;
    }
    
    // Validate method
    if (!validateMethod(req, allowedMethods)) {
      return createErrorResponse(
        'Method not allowed',
        `Only ${allowedMethods.join(', ')} methods are allowed`,
        405,
        req
      );
    }
    
    // Validate origin in production
    if (requireValidOrigin && !validateOrigin(req)) {
      return createErrorResponse(
        'Origin not allowed',
        'Request origin is not allowed',
        403,
        req
      );
    }
    
    // Apply rate limiting if provided
    if (rateLimiter) {
      const rateLimitResult = rateLimiter.checkRateLimit(req);
      if (!rateLimitResult.allowed) {
        return createErrorResponse(
          'Rate limit exceeded',
          'Too many requests. Please try again later.',
          429,
          req
        );
      }
    }
    
    try {
      return await handler(req);
    } catch (error) {
      console.error('Handler error:', error);
      return createErrorResponse(
        'Internal server error',
        'An unexpected error occurred',
        500,
        req
      );
    }
  };
} 