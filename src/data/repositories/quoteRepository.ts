import { openDatabase } from "../db/sqlite";
import type { Quote } from "../../constants/types";
import { DEFAULT_QUOTES } from "../../constants/defaultQuotes";

export async function getActiveQuotes(): Promise<Quote[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    text: string;
    author: string | null;
    active: number;
  }>("SELECT * FROM quotes WHERE active = 1");

  return rows.map(row => ({
    id: row.id,
    text: row.text,
    author: row.author ?? undefined,
    active: Boolean(row.active),
  }));
}

export async function getRandomQuote(): Promise<Quote | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    text: string;
    author: string | null;
    active: number;
  }>("SELECT * FROM quotes WHERE active = 1 ORDER BY RANDOM() LIMIT 1");

  if (!row) return null;

  return {
    id: row.id,
    text: row.text,
    author: row.author ?? undefined,
    active: Boolean(row.active),
  };
}

export async function insertQuote(quote: Quote): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    "INSERT INTO quotes (id, text, author, active) VALUES (?, ?, ?, ?)",
    quote.id,
    quote.text,
    quote.author ?? null,
    quote.active ? 1 : 0
  );
}

export async function seedQuotesIfEmpty(): Promise<void> {
  const db = await openDatabase();
  const count = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM quotes");

  if (count && count.count > 0) return;

  for (let i = 0; i < DEFAULT_QUOTES.length; i++) {
    const quote = DEFAULT_QUOTES[i];
    await db.runAsync(
      "INSERT INTO quotes (id, text, author, active) VALUES (?, ?, ?, ?)",
      `quote_${i}`,
      quote.text,
      quote.author ?? null,
      1
    );
  }
}
