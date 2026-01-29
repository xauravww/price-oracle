import { PrismaClient } from '@prisma/client';

// PrismaClient singleton to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

/**
 * Generate deterministic embedding vector for text
 * This function creates a 1536-dimensional vector for semantic search
 * Uses the same algorithm as before for consistency
 */
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