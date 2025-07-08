// Input validation and sanitization utilities for Edge Functions

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

export class InputValidator {
  
  // Email validation with strict regex
  static validateEmail(email: unknown): ValidationResult {
    const errors: string[] = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email must be a string');
      return { isValid: false, errors };
    }
    
    // Length check
    if (email.length > 254) {
      errors.push('Email too long (max 254 characters)');
    }
    
    if (email.length < 5) {
      errors.push('Email too short (min 5 characters)');
    }
    
    // Strict email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push('Invalid email format');
    }
    
    const sanitized = email.toLowerCase().trim();
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  // Token validation (UUID format)
  static validateToken(token: unknown): ValidationResult {
    const errors: string[] = [];
    
    if (!token || typeof token !== 'string') {
      errors.push('Token must be a string');
      return { isValid: false, errors };
    }
    
    // Length check for UUID
    if (token.length !== 36) {
      errors.push('Invalid token format');
    }
    
    // UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(token)) {
      errors.push('Invalid token format');
    }
    
    // Check for suspicious characters
    if (!/^[a-f0-9-]+$/i.test(token)) {
      errors.push('Token contains invalid characters');
    }
    
    const sanitized = token.toLowerCase().trim();
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  // Validate subscription action
  static validateAction(action: unknown): ValidationResult {
    const errors: string[] = [];
    const validActions = ['get_subscription_status', 'create_customer_portal', 'cancel_subscription', 'delete_account'];
    
    if (!action || typeof action !== 'string') {
      errors.push('Action must be a string');
      return { isValid: false, errors };
    }
    
    if (action.length > 50) {
      errors.push('Action too long');
    }
    
    if (!validActions.includes(action)) {
      errors.push('Invalid action type');
    }
    
    const sanitized = action.trim();
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  // Validate Stripe customer ID
  static validateStripeCustomerId(customerId: unknown): ValidationResult {
    const errors: string[] = [];
    
    if (!customerId || typeof customerId !== 'string') {
      errors.push('Customer ID must be a string');
      return { isValid: false, errors };
    }
    
    // Length check
    if (customerId.length > 100) {
      errors.push('Customer ID too long');
    }
    
    // Stripe customer ID format: cus_xxxxxxxxxxxxx
    if (!customerId.startsWith('cus_')) {
      errors.push('Invalid Stripe customer ID format');
    }
    
    // Check for valid characters (alphanumeric and underscores)
    if (!/^cus_[a-zA-Z0-9_]+$/.test(customerId)) {
      errors.push('Customer ID contains invalid characters');
    }
    
    const sanitized = customerId.trim();
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  // General string sanitization
  static sanitizeString(input: unknown, maxLength: number = 1000): ValidationResult {
    const errors: string[] = [];
    
    if (input === null || input === undefined) {
      return { isValid: true, errors: [], sanitized: null };
    }
    
    if (typeof input !== 'string') {
      errors.push('Input must be a string');
      return { isValid: false, errors };
    }
    
    if (input.length > maxLength) {
      errors.push(`Input too long (max ${maxLength} characters)`);
    }
    
    // Remove potentially dangerous characters
    const sanitized = input
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[<>'"&]/g, ''); // Remove HTML/script characters
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  // Validate subscription status
  static validateStatus(status: unknown): ValidationResult {
    const errors: string[] = [];
    const validStatuses = ['trialing', 'active', 'inactive'];
    
    if (!status || typeof status !== 'string') {
      errors.push('Status must be a string');
      return { isValid: false, errors };
    }
    
    if (!validStatuses.includes(status)) {
      errors.push('Invalid status value');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? status : undefined
    };
  }
  
  // Validate JSON request body
  static validateRequestBody(body: any, requiredFields: string[]): ValidationResult {
    const errors: string[] = [];
    
    if (!body || typeof body !== 'object') {
      errors.push('Request body must be a valid JSON object');
      return { isValid: false, errors };
    }
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in body) || body[field] === null || body[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check for suspicious keys (potential injection attempts)
    const suspiciousKeys = ['__proto__', 'constructor', 'prototype'];
    for (const key of Object.keys(body)) {
      if (suspiciousKeys.includes(key)) {
        errors.push(`Prohibited field: ${key}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: body
    };
  }
}

// Utility function to create standardized validation error response
export function createValidationErrorResponse(
  errors: string[], 
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      success: false,
      error: 'Validation failed',
      details: errors 
    }), 
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Environment variable validation
export class EnvironmentValidator {
  static validateRequiredEnvVars(required: string[]): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    for (const envVar of required) {
      const value = Deno.env.get(envVar);
      if (!value || value.trim() === '') {
        missing.push(envVar);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
  
  static getValidatedEnvVar(name: string, defaultValue?: string): string {
    const value = Deno.env.get(name);
    if (!value || value.trim() === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value.trim();
  }
} 