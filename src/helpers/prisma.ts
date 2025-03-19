'use server';

import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Maximum number of connection retries
 */
const MAX_RETRIES = 3;

/**
 * Delay between retries in milliseconds
 */
const RETRY_DELAY = 1000;

// Checking if we're on the server-side
const isServer = typeof window === 'undefined';

/**
 * Configuration for Prisma Client
 */
const prismaClientConfig: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
};

/**
 * Singleton PrismaClient instance with connection management
 */
class PrismaManager {
  private static instance: PrismaClient | null = null;
  private static connectionPromise: Promise<void> | null = null;

  /**
   * Gets the PrismaClient instance, creating it if necessary
   */
  static getInstance(): PrismaClient {
    if (!isServer) {
      // Return a mock or throw an error in browser environments
      console.error("Attempted to use PrismaClient in browser environment. This is likely due to importing a server component in a client component.");
      throw new Error("PrismaClient cannot be used in browser environments. Make sure you're not importing server components or database logic in client components.");
    }

    if (!PrismaManager.instance) {
      PrismaManager.instance = new PrismaClient(prismaClientConfig);
    }
    return PrismaManager.instance;
  }

  /**
   * Initializes the database connection
   */
  static async connect(retries = MAX_RETRIES): Promise<void> {
    if (!isServer) {
      console.error("Attempted to connect to database in browser environment");
      return;
    }

    if (!PrismaManager.connectionPromise) {
      PrismaManager.connectionPromise = (async () => {
        let currentRetry = 0;
        
        while (currentRetry <= retries) {
          try {
            const client = PrismaManager.getInstance();
            await client.$connect();
            console.log("Successfully connected to database");
            return;
          } catch (error) {
            console.error("Failed to connect to database:", error);
            
            if (currentRetry >= retries) {
              PrismaManager.connectionPromise = null;
              throw new Error("Failed to connect to database after multiple attempts");
            }
            
            currentRetry++;
            console.log(`Retrying connection (${currentRetry}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          }
        }
      })();
    }
    
    return PrismaManager.connectionPromise;
  }

  /**
   * Disconnects from the database
   */
  static async disconnect(): Promise<void> {
    if (!isServer || !PrismaManager.instance) {
      return;
    }

    try {
      await PrismaManager.instance.$disconnect();
      PrismaManager.instance = null;
      PrismaManager.connectionPromise = null;
      console.log("Successfully disconnected from database");
    } catch (error) {
      console.error("Failed to disconnect from database:", error);
    }
  }
}

// Initialize connection
if (isServer) {
  PrismaManager.connect().catch((error) => {
    console.error("Initial database connection failed:", error);
    process.exit(1);
  });

  // Handle cleanup on application shutdown
  process.on("beforeExit", async () => {
    await PrismaManager.disconnect();
  });
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
