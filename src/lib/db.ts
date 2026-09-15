import { Db, MongoClient } from "mongodb";

let cachedDb: Db;
let indexesEnsured = false;

// Function to connect to MongoDB, reusing a cached connection if available
export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(process.env.MONGODB_URI || "");
  const db = client.db(process.env.MONGODB_DBNAME);
  cachedDb = db;
  return db;
}

// Create the indexes the analytics dashboard queries against (idempotent).
export async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;

  await db
    .collection("errors")
    .createIndexes([
      { key: { date: -1 } },
      { key: { errorType: 1, date: -1 } },
      { key: { severity: 1, date: -1 } },
    ])
    .catch((e) => console.error("ensureIndexes failed:", e));
}
