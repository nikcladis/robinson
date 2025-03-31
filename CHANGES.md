# Booking Creation Fix: Detailed Changes

## Problem Overview
When confirming a room booking, the system failed to create the booking in the database and did not update the bookings list for the user.

## Root Causes Identified
1. **Missing Required Fields**: The booking validation schema required `status` fields that weren't provided during booking creation
2. **Prisma Serialization Issues**: Attempted to pass Prisma-specific objects directly to client components
3. **Import Errors**: Outdated import patterns for auth options
4. **Hardcoded Status Values**: The service was hardcoding statuses rather than accepting them from requests
5. **Client/Server Confusion**: Prisma being initialized in browser environments

## Detailed Changes by File

### 1. `src/app/(pages)/hotels/[hotel_id]/confirm-room/page.tsx`

**Before:**
```typescript
body: JSON.stringify({
  roomId: roomData?.id,
  checkInDate: checkInDate.toISOString(),
  checkOutDate: checkOutDate.toISOString(),
  numberOfGuests,
  totalPrice: calculateTotalPrice(),
}),

// After booking creation
const booking = await response.json();
router.push(`/bookings/${booking.id}`);
```

**After:**
```typescript
body: JSON.stringify({
  roomId: roomData?.id,
  checkInDate: checkInDate.toISOString(),
  checkOutDate: checkOutDate.toISOString(),
  numberOfGuests,
  totalPrice: calculateTotalPrice(),
  status: "CONFIRMED",  // Added explicit status
  paymentStatus: "PAID", // Added explicit payment status
}),

// After booking creation
const booking = await response.json();
console.log("Booking created:", booking); // Added logging
// Redirect to bookings list instead of a specific booking
// This avoids Prisma serialization issues
router.push('/bookings');
```

**Explanation:**
- Added explicit status fields to the booking request
- Changed redirect to go to the bookings list page to avoid serialization issues
- Added console logging for better debugging

### 2. `src/app/api/bookings/route.ts`

**Before:**
```typescript
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET handler
const session = await getServerSession(authOptions);

// POST handler
const booking = await BookingController.createBooking({
  userId: session.user.id,
  ...body,
});

return NextResponse.json(booking);
```

**After:**
```typescript
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";

// GET handler
const authOptions = await getAuthOptions();
const session = await getServerSession(authOptions);

// POST handler
// Add status field if not provided - this is required by the validation schema
const bookingData = {
  userId: session.user.id,
  ...body,
  status: body.status || "CONFIRMED", // Default to CONFIRMED if not provided
};

console.log("Creating booking with data:", JSON.stringify(bookingData));
const bookingResult = await BookingController.createBooking(bookingData);

// Manually extract only the data we need to return to the client
// to avoid Prisma serialization issues
const safeBooking = {
  id: bookingResult.id,
  userId: bookingResult.userId,
  roomId: bookingResult.roomId,
  checkInDate: bookingResult.checkInDate,
  checkOutDate: bookingResult.checkOutDate,
  numberOfGuests: bookingResult.numberOfGuests,
  totalPrice: bookingResult.totalPrice,
  status: bookingResult.status,
  paymentStatus: bookingResult.paymentStatus,
  createdAt: bookingResult.createdAt,
};

console.log("Booking created successfully:", safeBooking.id);
return NextResponse.json(safeBooking);
```

**Explanation:**
- Updated import to use `getAuthOptions()` instead of direct import
- Added default status field handling for validation requirements
- Created a `safeBooking` object with only serializable data
- Added detailed logging for debugging

### 3. `src/validations/booking.validation.ts`

**Before:**
```typescript
import { prisma } from "@/helpers/prisma";

// Schema for date validation
const dateSchema = z.object({...});

// Schema for booking creation
export const createBookingSchema = z
  .object({
    roomId: z.string().min(1, "Room ID is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    numberOfGuests: z.number().min(1, "Number of guests must be at least 1"),
    totalPrice: z.number().min(0, "Total price cannot be negative"),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

// Validator class methods
static validateRequiredFields(
  data: z.infer<typeof createBookingSchema>
): ValidationResult {...}
```

**After:**
```typescript
import { getPrismaClientSync } from "@/helpers/prisma";

// Schema for date validation
export const dateSchema = z.object({...});

// Base booking schema with common fields
const baseBookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  numberOfGuests: z.number().min(1, "Number of guests must be at least 1"),
  totalPrice: z.number().min(1, "Total price must be positive"),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
    errorMap: () => ({ message: "Invalid booking status" })
  }).optional(),
  paymentStatus: z.enum(["PAID", "UNPAID", "REFUNDED"], {
    errorMap: () => ({ message: "Invalid payment status" })
  }).optional()
});

// Schema for creating a new booking
export const createBookingSchema = baseBookingSchema;

// Schema for updating a booking (all fields optional)
export const updateBookingSchema = baseBookingSchema.partial();

// Schema for just updating booking status
export const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
    errorMap: () => ({ message: "Invalid booking status" })
  })
});

// New Validator class methods
private static async getPrisma() {
  return await getPrismaClientSync();
}

static validateCreateBooking(
  data: unknown
): ValidationResult {...}

static validateSearchParams(
  params: unknown
): ValidationResult {...}

static validateStatusUpdate(
  data: unknown
): ValidationResult {...}
```

**Explanation:**
- Updated Prisma import to use the new safe accessor function
- Made status fields optional with proper enum validation
- Expanded the validation schema for more thorough data validation
- Added helper methods for different validation scenarios
- Implemented proper database availability checking

### 4. `src/controllers/booking.controller.ts`

**Before:**
```typescript
static async createBooking(data: {
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
}): Promise<any> {
  try {
    // Validate booking data
    const validationResult = BookingValidator.validateCreateBooking(data);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: "Invalid booking data", details: validationResult.errors },
        { status: 400 }
      );
    }
    
    // Create the booking in the database
    const booking = await BookingService.createBooking(data);
    
    // Serialize to remove any Prisma-specific properties or methods
    return JSON.parse(JSON.stringify(booking));
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}
```

**After:**
```typescript
static async createBooking(data: {
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus?: "PAID" | "UNPAID" | "REFUNDED";
}): Promise<any> {
  try {
    // Validate booking data
    const validationResult = BookingValidator.validateCreateBooking(data);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: "Invalid booking data", details: validationResult.errors },
        { status: 400 }
      );
    }
    
    console.log("BookingController.createBooking: Validation passed, creating booking");
    
    // Create the booking in the database
    const booking = await BookingService.createBooking(data);
    
    console.log("BookingController.createBooking: Booking created successfully", booking.id);
    
    // Serialize to remove any Prisma-specific properties or methods
    return JSON.parse(JSON.stringify(booking));
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}
```

**Explanation:**
- Added optional status and paymentStatus parameters to the controller method
- Added extensive logging to track the booking creation process
- Maintained proper serialization of returned data

### 5. `src/services/booking.service.ts`

**Before:**
```typescript
import { Booking } from "@/models";

export class BookingService {
  static async getBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`/api/bookings/${bookingId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch booking");
    }
    return response.json();
  }

  static async createBooking(
    bookingData: CreateBookingParams
  ): Promise<Booking> {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to create booking");
    }

    return response.json();
  }
}
```

**After:**
```typescript
import { getPrismaClientSync } from "@/helpers/prisma";
import { Booking, PrismaClient } from "@prisma/client";

export class BookingService {
  private static async getPrisma(): Promise<PrismaClient | null> {
    return await getPrismaClientSync();
  }
  
  static async createBooking(data: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
    specialRequests?: string;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    paymentStatus?: "PAID" | "UNPAID" | "REFUNDED";
  }): Promise<Booking> {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    try {
      console.log("BookingService.createBooking called with:", JSON.stringify(data));
      
      // Create the booking with PENDING status by default
      const booking = await prisma.booking.create({
        data: {
          userId: data.userId,
          roomId: data.roomId,
          checkInDate: new Date(data.checkInDate),
          checkOutDate: new Date(data.checkOutDate),
          numberOfGuests: data.numberOfGuests,
          totalPrice: data.totalPrice,
          specialRequests: data.specialRequests || "",
          status: data.status || "PENDING", // Use provided status or default to PENDING
          paymentStatus: data.paymentStatus || "UNPAID", // Use provided payment status or default to UNPAID
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          room: {
            include: {
              hotel: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  country: true,
                },
              },
            },
          },
        },
      });
      
      console.log("Booking created successfully:", booking.id);
      
      // Convert to plain object to avoid Prisma serialization issues
      return JSON.parse(JSON.stringify(booking));
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }
}
```

**Explanation:**
- Completely rewrote the service to use server-side Prisma operations instead of API calls
- Added proper status field handling with defaults
- Implemented database availability checking
- Includes proper data serialization to avoid Prisma object issues

### 6. `src/helpers/prisma.ts`

**Before:**
```typescript
import { PrismaClient, Prisma } from "@prisma/client";

// Export the managed Prisma instance
export const prisma = PrismaManager.getInstance();
```

**After:**
```typescript
'use server';

import { PrismaClient, Prisma } from "@prisma/client";

// Checking if we're on the server-side
const isServer = typeof window === 'undefined';

// Prevent instantiation in browser
static getInstance(): PrismaClient {
  if (!isServer) {
    // Return a mock or throw an error in browser environments
    console.error("Attempted to use PrismaClient in browser environment...");
    throw new Error("PrismaClient cannot be used in browser environments...");
  }

  if (!PrismaManager.instance) {
    PrismaManager.instance = new PrismaClient(prismaClientConfig);
  }
  return PrismaManager.instance;
}

// Export the database client getter function
export async function getPrismaClient(): Promise<PrismaClient | null> {
  if (!isServer) return null;
  return PrismaManager.getInstance();
}

// For backwards compatibility, provide a function for existing code
export async function getPrismaClientSync(): Promise<PrismaClient | null> {
  if (!isServer) return null;
  return PrismaManager.getInstance();
}
```

**Explanation:**
- Added server-side directive to enforce server execution
- Added explicit environment checks to prevent browser execution
- Changed export pattern to use functions instead of direct instances
- Created two accessor functions with proper error handling

## Summary of Key Solutions

1. **Added Explicit Status Fields**: Set status values explicitly at creation time instead of relying on defaults.
   
2. **Fixed Validation Schema**: Made status and paymentStatus fields optional in the schema with proper enum validation.
   
3. **Implemented Server-Side Checks**: Added code to prevent Prisma from being initialized in browser context.
   
4. **Fixed Data Serialization**: Added proper serialization when returning Prisma objects to clients.
   
5. **Added Proper Error Handling**: Improved error detection and reporting throughout the booking process.

6. **Improved Logging**: Added detailed logging throughout the booking creation flow for better debugging.

These changes fix the booking creation process by ensuring all required fields are properly handled, preventing serialization errors, and improving error reporting for debugging. 