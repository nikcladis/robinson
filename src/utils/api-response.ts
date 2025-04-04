import { NextResponse } from "next/server";
import { ErrorHandler } from "./error-handler";
import { corsHeaders } from "@/config/cors"; // Import centralized headers

/**
 * Standard success response format for API endpoints
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    [key: string]: unknown;
  };
}

/**
 * API response utilities for creating standardized responses
 */
export class ApiResponse {
  /**
   * Creates a success response
   */
  static success<T>(data: T, status = 200, meta?: Record<string, unknown>): NextResponse {
    const body: ApiSuccessResponse<T> = {
      success: true,
      data
    };
    
    if (meta) {
      body.meta = meta;
    }
    
    // Use centralized CORS headers
    return NextResponse.json(body, { status, headers: corsHeaders });
  }
  
  /**
   * Creates a success response for created resources
   */
  static created<T>(data: T, meta?: Record<string, unknown>): NextResponse {
    return this.success(data, 201, meta);
  }
  
  /**
   * Creates a success response with no content
   */
  static noContent(): NextResponse {
    // Use centralized CORS headers
    return new NextResponse(null, { status: 204, headers: corsHeaders });
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