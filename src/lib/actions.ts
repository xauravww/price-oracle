
"use server";

import db, { getEmbedding } from './db';
import { PriceEntry } from './priceEngine';
import { revalidatePath } from 'next/cache';

export async function getEntries(): Promise<PriceEntry[]> {
  const stmt = db.prepare('SELECT * FROM price_entries ORDER BY timestamp DESC');
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    ...row,
    timestamp: new Date(row.timestamp),
    isTrusted: Boolean(row.isTrusted)
  }));
}

export async function addEntry(entry: Omit<PriceEntry, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'isTrusted'>) {
  const id = Math.random().toString(36).substr(2, 9);
  
  // 1. Save to main table
  const stmt = db.prepare(`
    INSERT INTO price_entries (id, item, location, price, contributorId)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, entry.item, entry.location, entry.price, entry.contributorId);

  // 2. Generate and save embedding
  try {
    const embedding = await getEmbedding(entry.item);
    const vecStmt = db.prepare(`
      INSERT INTO vec_items (id, embedding)
      VALUES (?, ?)
    `);
    // sqlite-vec expects Float32Array for embeddings
    vecStmt.run(id, new Float32Array(embedding));
  } catch (e) {
    console.error("Failed to save embedding:", e);
  }

  try {
    revalidatePath('/');
  } catch (e) {
    // Ignore revalidation error in non-Next.js environments
  }
}

export async function searchSimilarEntries(query: string): Promise<PriceEntry[]> {
  try {
    const queryEmbedding = await getEmbedding(query);
    
    // Search for top 10 similar items using vector similarity
    const stmt = db.prepare(`
      SELECT 
        p.*,
        v.distance
      FROM vec_items v
      JOIN price_entries p ON v.id = p.id
      WHERE v.embedding MATCH ?
        AND k = 10
      ORDER BY distance
    `);
    
    const rows = stmt.all(new Float32Array(queryEmbedding)) as any[];
    
    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp),
      isTrusted: Boolean(row.isTrusted)
    }));
  } catch (e) {
    console.error("Vector search failed:", e);
    return [];
  }
}
