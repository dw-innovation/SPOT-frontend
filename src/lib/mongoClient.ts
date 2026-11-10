import { MongoClient } from "mongodb";

// A shared client promise for the NextAuth adapter. Cached on globalThis so
// dev hot reloads don't open a new connection every time.
const globalForMongo = globalThis as unknown as {
  _authMongoClient?: Promise<MongoClient>;
};

const mongoClientPromise = (): Promise<MongoClient> => {
  globalForMongo._authMongoClient ??= MongoClient.connect(
    process.env.MONGODB_URI || ""
  );
  return globalForMongo._authMongoClient;
};

export default mongoClientPromise;
