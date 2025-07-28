const mongoose = require('mongoose');

/**
 * Database configuration and connection
 */
class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB database
   */
  async connect() {
    try {
      // Prevent multiple connections
      if (this.isConnected) {
        console.log('Database already connected');
        return this.connection;
      }

      // Connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);
      this.isConnected = true;

      console.log(`MongoDB connected: ${this.connection.connection.host}`);

      // Handle connection events
      this.setupEventHandlers();

      return this.connection;

    } catch (error) {
      console.error('Database connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Setup database event handlers
   */
  setupEventHandlers() {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    connection.on('error', (error) => {
      console.error('Mongoose connection error:', error);
      this.isConnected = false;
    });

    connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    try {
      if (this.isConnected && this.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('Database connection closed');
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  /**
   * Database health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      // Simple ping to check if database is responsive
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ...this.getConnectionStatus()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        ...this.getConnectionStatus()
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const stats = await mongoose.connection.db.stats();
      
      return {
        database: stats.db,
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        avgObjSize: stats.avgObjSize
      };

    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }

  /**
   * Create database indexes
   */
  async createIndexes() {
    try {
      console.log('Creating database indexes...');

      // User indexes
      await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.collection('users').createIndex({ username: 1 }, { unique: true });
      await mongoose.connection.collection('users').createIndex({ 'profile.phone': 1 });
      await mongoose.connection.collection('users').createIndex({ createdAt: -1 });
      await mongoose.connection.collection('users').createIndex({ lastLogin: -1 });

      // Product indexes
      await mongoose.connection.collection('products').createIndex({ sku: 1 }, { unique: true });
      await mongoose.connection.collection('products').createIndex({ category: 1, subcategory: 1 });
      await mongoose.connection.collection('products').createIndex({ price: 1 });
      await mongoose.connection.collection('products').createIndex({ averageRating: -1 });
      await mongoose.connection.collection('products').createIndex({ salesCount: -1 });
      await mongoose.connection.collection('products').createIndex({ createdAt: -1 });
      await mongoose.connection.collection('products').createIndex({ 
        name: 'text', 
        description: 'text', 
        tags: 'text' 
      });

      // Order indexes
      await mongoose.connection.collection('orders').createIndex({ userId: 1, createdAt: -1 });
      await mongoose.connection.collection('orders').createIndex({ status: 1 });
      await mongoose.connection.collection('orders').createIndex({ 'payment.transactionId': 1 });

      console.log('Database indexes created successfully');

    } catch (error) {
      console.error('Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Drop database (use with caution!)
   */
  async dropDatabase() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      await mongoose.connection.db.dropDatabase();
      console.log('Database dropped successfully');

    } catch (error) {
      console.error('Error dropping database:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;