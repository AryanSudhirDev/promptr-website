// Simple in-memory rate limiter for Edge Functions
// Note: In production, consider using Redis or Supabase for distributed rate limiting

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  private getClientKey(req: Request): string {
    // Use IP address as the key (with fallbacks)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    return forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  }

  checkRateLimit(req: Request): { allowed: boolean; resetTime?: number; remaining?: number } {
    const clientKey = this.getClientKey(req);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    // Get or create client record
    let clientRecord = this.store[clientKey];
    
    if (!clientRecord || clientRecord.resetTime < now) {
      // Create new record or reset expired one
      clientRecord = {
        count: 0,
        resetTime: resetTime
      };
      this.store[clientKey] = clientRecord;
    }

    // Increment request count
    clientRecord.count++;

    // Check if limit exceeded
    if (clientRecord.count > this.config.maxRequests) {
      return {
        allowed: false,
        resetTime: clientRecord.resetTime,
        remaining: 0
      };
    }

    return {
      allowed: true,
      resetTime: clientRecord.resetTime,
      remaining: this.config.maxRequests - clientRecord.count
    };
  }

  createRateLimitHeaders(result: { allowed: boolean; resetTime?: number; remaining?: number }): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
    };

    if (result.resetTime) {
      headers['X-RateLimit-Reset'] = Math.ceil(result.resetTime / 1000).toString();
    }

    if (result.remaining !== undefined) {
      headers['X-RateLimit-Remaining'] = result.remaining.toString();
    }

    return headers;
  }
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Token validation - stricter limits
  TOKEN_VALIDATION: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  
  // General API - moderate limits  
  API_GENERAL: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  
  // Stripe webhooks - more lenient (legitimate traffic)
  WEBHOOKS: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 requests per minute
  
  // Auth operations - stricter
  AUTH_OPERATIONS: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
};

// Create rate limiter instances
export const tokenValidationLimiter = new RateLimiter(RATE_LIMITS.TOKEN_VALIDATION);
export const apiGeneralLimiter = new RateLimiter(RATE_LIMITS.API_GENERAL);
export const webhooksLimiter = new RateLimiter(RATE_LIMITS.WEBHOOKS);
export const authOperationsLimiter = new RateLimiter(RATE_LIMITS.AUTH_OPERATIONS);

// Utility function to handle rate limiting in Edge Functions
export function handleRateLimit(
  req: Request, 
  limiter: RateLimiter, 
  corsHeaders: Record<string, string>
): Response | null {
  const result = limiter.checkRateLimit(req);
  const rateLimitHeaders = limiter.createRateLimitHeaders(result);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.',
        resetTime: result.resetTime 
      }), 
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime! - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // Add rate limit headers to successful responses
  Object.assign(corsHeaders, rateLimitHeaders);
  return null; // No rate limit hit
} 