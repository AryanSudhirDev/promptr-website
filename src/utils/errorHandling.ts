interface ApiError {
  type: 'NETWORK' | 'VALIDATION' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'SERVER' | 'UNKNOWN';
  message: string;
  details?: string;
  retryable: boolean;
}

interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private notifications: NotificationOptions[] = [];
  private subscribers: ((notifications: NotificationOptions[]) => void)[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: NotificationOptions[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Add notification
  private addNotification(notification: NotificationOptions): void {
    const id = Date.now().toString();
    const notificationWithId = { ...notification, id };
    this.notifications.push(notificationWithId);
    this.notifySubscribers();

    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration || 5000);
    }
  }

  // Remove notification
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => (n as any).id !== id);
    this.notifySubscribers();
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notifications = [];
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  // Parse and categorize errors
  parseError(error: any): ApiError {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'NETWORK',
        message: 'Unable to connect to server. Please check your internet connection.',
        retryable: true
      };
    }

    // Response-based errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            type: 'VALIDATION',
            message: 'Invalid request. Please check your input and try again.',
            retryable: false
          };
        case 401:
          return {
            type: 'AUTHENTICATION',
            message: 'Please sign in to continue.',
            retryable: false
          };
        case 403:
          return {
            type: 'AUTHORIZATION',
            message: 'You don\'t have permission to access this resource.',
            retryable: false
          };
        case 404:
          return {
            type: 'VALIDATION',
            message: 'The requested resource was not found.',
            retryable: false
          };
        case 429:
          return {
            type: 'SERVER',
            message: 'Too many requests. Please wait a moment and try again.',
            retryable: true
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'SERVER',
            message: 'Server is temporarily unavailable. Please try again in a moment.',
            retryable: true
          };
        default:
          return {
            type: 'UNKNOWN',
            message: 'An unexpected error occurred. Please try again.',
            retryable: true
          };
      }
    }

    // Parse JSON error responses
    if (error.message && typeof error.message === 'string') {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message) {
          return {
            type: 'VALIDATION',
            message: parsed.message,
            retryable: false
          };
        }
      } catch {
        // Not JSON, continue
      }
    }

    // Default error
    return {
      type: 'UNKNOWN',
      message: error.message || 'An unexpected error occurred. Please try again.',
      retryable: true
    };
  }

  // Handle API errors with proper user feedback
  handleError(error: any, context?: string): ApiError {
    const apiError = this.parseError(error);
    
    // Log error for debugging (sanitized)
    console.error(`[${context || 'API'}] ${apiError.type}:`, {
      message: apiError.message,
      type: apiError.type,
      retryable: apiError.retryable
    });

    // Show user notification
    this.addNotification({
      type: 'error',
      title: this.getErrorTitle(apiError.type),
      message: apiError.message,
      duration: apiError.retryable ? 7000 : 5000,
      persistent: apiError.type === 'AUTHENTICATION'
    });

    return apiError;
  }

  // Handle success notifications
  handleSuccess(message: string, title: string = 'Success'): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }

  // Handle warning notifications
  handleWarning(message: string, title: string = 'Warning'): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000
    });
  }

  // Handle info notifications
  handleInfo(message: string, title: string = 'Info'): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration: 5000
    });
  }

  private getErrorTitle(type: ApiError['type']): string {
    switch (type) {
      case 'NETWORK':
        return 'Connection Error';
      case 'VALIDATION':
        return 'Invalid Request';
      case 'AUTHENTICATION':
        return 'Authentication Required';
      case 'AUTHORIZATION':
        return 'Access Denied';
      case 'SERVER':
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  // Retry mechanism for API calls
  async retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        const apiError = this.parseError(error);
        
        // Don't retry non-retryable errors
        if (!apiError.retryable || attempt === maxRetries) {
          throw error;
        }
        
        // Log retry attempt
        console.warn(`[${context || 'API'}] Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
    
    throw lastError;
  }

  // Enhanced fetch wrapper with error handling
  async enhancedFetch(
    url: string,
    options: RequestInit = {},
    context?: string
  ): Promise<Response> {
    const enhancedOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await this.retryApiCall(
        () => fetch(url, enhancedOptions),
        3,
        1000,
        context
      );

      if (!response.ok) {
        // Try to get error details from response
        let errorDetails: string | undefined;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorDetails = errorData.message || errorData.error || errorText;
          }
        } catch {
          // Unable to parse error response
        }

        throw {
          status: response.status,
          statusText: response.statusText,
          message: errorDetails || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return response;
    } catch (error) {
      // Handle and rethrow with context
      this.handleError(error, context);
      throw error;
    }
  }

  // Get current notifications
  getNotifications(): NotificationOptions[] {
    return this.notifications;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export types for use in components
export type { ApiError, NotificationOptions };

// Utility functions
export const handleApiError = (error: any, context?: string): ApiError => {
  return errorHandler.handleError(error, context);
};

export const handleSuccess = (message: string, title?: string): void => {
  errorHandler.handleSuccess(message, title);
};

export const handleWarning = (message: string, title?: string): void => {
  errorHandler.handleWarning(message, title);
};

export const handleInfo = (message: string, title?: string): void => {
  errorHandler.handleInfo(message, title);
};

export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries?: number,
  delayMs?: number,
  context?: string
): Promise<T> => {
  return errorHandler.retryApiCall(apiCall, maxRetries, delayMs, context);
};

export const enhancedFetch = (
  url: string,
  options?: RequestInit,
  context?: string
): Promise<Response> => {
  return errorHandler.enhancedFetch(url, options, context);
}; 