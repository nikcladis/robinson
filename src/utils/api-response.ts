import { NextResponse } from "next/server";
import { ErrorHandler } from "./error-handler";

/**
 * Standard success response format for API endpoints
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    [key: string]: any;
  };
}

/**
 * API response utilities for creating standardized responses
 */
export class ApiResponse {
  /**
   * Creates a success response
   */
  static success<T>(data: T, status = 200, meta?: any): NextResponse {
    const body: ApiSuccessResponse<T> = {
      success: true,
      data
    };
    
    if (meta) {
      body.meta = meta;
    }
    
    return NextResponse.json(body, { status });
  }
  
  /**
   * Creates a success response for created resources
   */
  static created<T>(data: T, meta?: any): NextResponse {
    return this.success(data, 201, meta);
  }
  
  /**
   * Creates a success response with no content
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }
  
  /**
   * Creates an error response
   */
  static error(
    error: unknown, 
    fallbackMessage = "An error occurred"
  ): NextResponse {
    return ErrorHandler.createErrorResponse(error, fallbackMessage);
  }
  
  /**
   * Handle API request with standardized try/catch pattern
   */
  static async handle<T>(
    handler: () => Promise<T>,
    errorMessage = "Request failed"
  ): Promise<NextResponse> {
    try {
      const result = await handler();
      
      // If the result is already a NextResponse, return it directly
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Convert null result to 204 No Content
      if (result === null || result === undefined) {
        return this.noContent();
      }
      
      // Otherwise, wrap in a success response
      return this.success(result);
    } catch (error) {
      return this.error(error, errorMessage);
    }
  }
} 