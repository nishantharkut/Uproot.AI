import { PrismaClient } from "@prisma/client";

// Handle missing DATABASE_URL gracefully
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Please configure your database connection.");
    // Return a mock client that will throw helpful errors
    return new Proxy({}, {
      get() {
        throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
      }
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
