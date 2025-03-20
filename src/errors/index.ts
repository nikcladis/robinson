/**
 * Base application error class that all other errors inherit from
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // This ensures the error stack trace points to where the error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Safely converts error to a loggable/serializable object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack
    };
  }
}

/**
 * Validation error - thrown when incoming data doesn't meet requirements
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Database error - thrown when database operations fail
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

/**
 * Not found error - thrown when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Authentication error - thrown when authentication fails
 */
export class AuthenticationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
  }
}

/**
 * Authorization error - thrown when a user lacks permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

/**
 * Conflict error - thrown when a resource already exists
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * External service error - thrown when an external API call fails
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, details);
  }
} 