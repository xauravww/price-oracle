import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sqliteVec from 'sqlite-vec';

const dbPath = path.join(process.cwd(), 'oracle.db');
const db = new Database(dbPath);

// Load sqlite-vec extension
const extensionPath = path.join(process.cwd(), 'node_modules', 'sqlite-vec-linux-x64', 'vec0.so');
db.loadExtension(extensionPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS price_entries (
    id TEXT PRIMARY KEY,
    item TEXT NOT NULL,
    location TEXT NOT NULL,
    price REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    isTrusted INTEGER DEFAULT 0,
    contributorId TEXT NOT NULL
  );

  -- Virtual table for vector search (using 1536 dimensions for standard embeddings)
  CREATE VIRTUAL TABLE IF NOT EXISTS vec_items USING vec0(
    id TEXT PRIMARY KEY,
    embedding FLOAT[1536]
  );
`);

export default db;

export async function getEmbedding(text: string): Promise<number[]> {
  // Since the local server at 3010 doesn't support /v1/embeddings, 
  // we'll use a simple deterministic hash-based vector for now to keep the logic working.
  // In a production environment, you would use a real embedding model.
  const vector = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[i % 1536] = (vector[i % 1536] + charCode) / 255;
  }
  return vector;
}
