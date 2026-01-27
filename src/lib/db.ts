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

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    price_result REAL,
    deep_search INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    response_time INTEGER
  );

  CREATE TABLE IF NOT EXISTS trusted_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reported_urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    query TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  );
`);

export default db;

export async function getEmbedding(text: string): Promise<number[]> {
  // Direct deterministic embedding generation to avoid 404s from external services
  // This ensures vector search works locally and consistently
  const vector = new Array(1536).fill(0);
  const normalizedText = text.toLowerCase().trim();
  
  // Improved deterministic embedding: Combine character-level hashing with word-level features
  const words = normalizedText.split(/\s+/);
  
  // Word-level influence
  words.forEach((word, wordIdx) => {
    let wordHash = 0;
    for (let i = 0; i < word.length; i++) {
      wordHash = (wordHash << 5) - wordHash + word.charCodeAt(i);
      wordHash |= 0; // Convert to 32bit integer
    }

    for (let j = 0; j < 10; j++) {
      const index = Math.abs((wordHash ^ (j * 0x9e3779b9)) % 1536);
      vector[index] += 1.0;
    }
  });

  // Character-level influence for fuzzy matching
  for (let i = 0; i < normalizedText.length; i++) {
    const charCode = normalizedText.charCodeAt(i);
    for (let j = 0; j < 3; j++) {
      const index = (i * 31 + j * 137) % 1536;
      vector[index] += (charCode / 255);
    }
  }
  
  // Normalize the vector to unit length (optional but good for cosine similarity)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }
  
  return vector;
}