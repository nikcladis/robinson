import { ZodError } from "zod";
import { NextResponse } from "next/server";
import {
  AppError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  ConflictError
} from "@/errors";
import { corsHeaders } from "@/config/cors"; // Import centralized headers

/**
 * ErrorHandler utility for standardized error handling across the application
 */
export class ErrorHandler {
  /**
   * Converts any error to an AppError instance
   */
  static normalizeError(error: unknown, defaultMessage = "An unexpected error occurred"): AppError {
    // If it's already an AppError, return it directly
    if (error instanceof AppError) {
      return error;
    }
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const details = error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      const errorObject = { validationErrors: details };
      return new ValidationError("Validation failed", errorObject);
    }
    
    // Handle Prisma errors
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      interface PrismaError extends Error {
        code: string;
        meta?: Record<string, unknown>;
      }
      
      const prismaError = error as PrismaError;
      
      // Handle common Prisma error codes
      if (prismaError.code === 'P2002') {
        return new ConflictError("A record with this identifier already exists");
      }
      
      if (prismaError.code === 'P2025') {
        return new NotFoundError("Record not found");
      }
      
      return new DatabaseError("Database operation failed", {
        code: prismaError.code,
        meta: prismaError.meta
      });
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
      return new AppError(error.message);
    }
    
    // Handle unknown errors (string, null, etc.)
    return new AppError(
      typeof error === 'string' ? error : defaultMessage
    );
  }
  
  /**
   * Handles repository layer errors
   */
  static handleRepositoryError(error: unknown, operation: string): never {
    const normalizedError = this.normalizeError(error);
    const context = `Repository error during ${operation}`;
    
    // Log the error with context
    console.error(context, normalizedError);
    
    // Rethrow with appropriate type
    if (normalizedError instanceof ValidationError ||
        normalizedError instanceof NotFoundError ||
        normalizedError instanceof ConflictError) {
      throw normalizedError;
    }
    
    // For other errors, wrap as DatabaseError
    throw new DatabaseError(`${context}: ${normalizedError.message}`, {
      originalError: normalizedError.toJSON(),
      operation
    });
  }
  
  /**
   * Handles controller layer errors
   */
  static handleControllerError(error: unknown, operation: string): never {
    const normalizedError = this.normalizeError(error);
    const context = `Controller error during ${operation}`;
    
    // Log the error with context
    console.error(context, normalizedError);
    
    // Controllers generally pass through errors to API layer
    throw normalizedError;
  }
  
  /**
   * Handles service layer errors in client-side code
   */
  static handleServiceError(error: unknown, operation: string): never {
    const normalizedError = this.normalizeError(error);
    const context = `Service error during ${operation}`;
    
    // Log the error with context
    console.error(context, normalizedError);
    
    // Services generally throw user-friendly errors
    const message = normalizedError.message || `Error during ${operation}`;
    throw new Error(message);
  }
  
  /**
   * Creates a standard API error response for API routes
   */
  static createErrorResponse(error: unknown, fallbackMessage = "An error occurred"): NextResponse {
    const normalizedError = this.normalizeError(error, fallbackMessage);
    
    // Create the response body
    const responseBody = {
      success: false,
      error: {
        message: normalizedError.message,
        code: normalizedError.code,
        details: undefined as unknown,
        stack: undefined as unknown
      }
    };
    
    // Include details in development mode
    if (process.env.NODE_ENV === "development") {
      responseBody.error.details = normalizedError.details;
      responseBody.error.stack = normalizedError.stack;
    }
    
    // Use centralized CORS headers
    return NextResponse.json(responseBody, { 
      status: normalizedError.statusCode,
      headers: corsHeaders // Use imported headers
    });
  }
  
  /**
   * Wraps an async function with standardized error handling
   */
  static wrapAsync<T>(
    fn: () => Promise<T>,
    errorHandler: (error: unknown) => never
  ): Promise<T> {
    return fn().catch(errorHandler);
  }
} 