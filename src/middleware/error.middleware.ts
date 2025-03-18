import { NextResponse } from "next/server";

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Handles errors in a consistent way across the application
 * @param error - The error to handle
 * @param defaultMessage - Default message to use if error is not an Error instance
 * @returns NextResponse with appropriate error message and status code
 */
export function handleError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error);

  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : defaultMessage,
    },
    { status: error instanceof Error ? 400 : 500 }
  );
}
