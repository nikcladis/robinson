import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Maximum number of connection retries
 */
const MAX_RETRIES = 3;

/**
 * Delay between retries in milliseconds
 */
const RETRY_DELAY = 1000;

/**
 * Configuration for Prisma Client
 */
const prismaClientConfig: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as Prisma.LogLevel[])
      : (["error"] as Prisma.LogLevel[]),
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
    if (!PrismaManager.instance) {
      PrismaManager.instance = new PrismaClient(prismaClientConfig);
    }
    return PrismaManager.instance;
  }

  /**
   * Connects to the database with retry logic
   */
  static async connect(retries = MAX_RETRIES): Promise<void> {
    if (!PrismaManager.connectionPromise) {
      PrismaManager.connectionPromise = (async () => {
        try {
          const client = PrismaManager.getInstance();
          await client.$connect();
          console.log("Successfully connected to database");
        } catch (error) {
          console.error("Failed to connect to database:", error);

          if (retries > 0) {
            console.log(
              `Retrying connection in ${RETRY_DELAY}ms... (${retries} attempts remaining)`
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            await PrismaManager.connect(retries - 1);
          } else {
            PrismaManager.connectionPromise = null;
            throw new Error(
              "Failed to connect to database after multiple attempts"
            );
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
    if (PrismaManager.instance) {
      await PrismaManager.instance.$disconnect();
      PrismaManager.instance = null;
      PrismaManager.connectionPromise = null;
    }
  }
}

// Initialize connection
PrismaManager.connect().catch((error) => {
  console.error("Initial database connection failed:", error);
  process.exit(1);
});

// Handle cleanup on application shutdown
process.on("beforeExit", async () => {
  await PrismaManager.disconnect();
});

// Export the managed Prisma instance
export const prisma = PrismaManager.getInstance();
