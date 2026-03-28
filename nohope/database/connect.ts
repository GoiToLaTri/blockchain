import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define the NEXT_PUBLIC_MONGO_URI");
}

// cache global để tránh multiple connections
declare global {
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = global as typeof globalThis & {
  _mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

class Mongo {
  private static instance: Mongo;

  private constructor() {}

  static getInstance() {
    if (!Mongo.instance) {
      Mongo.instance = new Mongo();
    }
    return Mongo.instance;
  }

  async connect() {
    if (!globalWithMongoose._mongoose) {
      globalWithMongoose._mongoose = { conn: null, promise: null };
    }

    const cache = globalWithMongoose._mongoose;

    if (cache.conn) {
      return cache.conn;
    }

    if (!cache.promise) {
      cache.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      });
    }

    cache.conn = await cache.promise;
    return cache.conn;
  }

  async disconnect() {
    if (!globalWithMongoose._mongoose?.conn) return;

    await mongoose.disconnect();
    globalWithMongoose._mongoose.conn = null;
    globalWithMongoose._mongoose.promise = null;
  }
}

export default Mongo.getInstance();
