import mongoose from 'mongoose';

interface MongoDBConnection {
  isConnected: boolean;
}

const connection: MongoDBConnection = {
  isConnected: false,
};

/**
 * Connects to MongoDB Atlas database
 * Uses connection caching to prevent multiple connections in serverless environments
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If already connected, return existing connection
  if (connection.isConnected) {
    console.log('Using existing database connection');
    return mongoose;
  }

  // Check if MONGODB_URI is defined
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  try {
    // Connect to MongoDB
    const db = await mongoose.connect(MONGODB_URI, {
      // These options are now defaults in Mongoose 6+
      // but explicitly setting them for clarity
      maxPoolSize: 10, // Maximum number of sockets for connection pool
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    connection.isConnected = true;
    console.log('MongoDB connected successfully');

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Disconnects from MongoDB
 * Useful for cleanup in tests or CLI scripts
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!connection.isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    connection.isConnected = false;
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw new Error('Failed to disconnect from database');
  }
}

/**
 * Gets the connection status
 */
export function getConnectionStatus(): boolean {
  return connection.isConnected;
}

export default mongoose;
