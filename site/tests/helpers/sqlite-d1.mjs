import { DatabaseSync } from "node:sqlite";
import { readdir, readFile } from "node:fs/promises";

function normalize(value) {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

class SQLiteD1Statement {
  constructor(database, query, values = []) {
    this.database = database;
    this.query = query;
    this.values = values;
  }

  bind(...values) {
    return new SQLiteD1Statement(this.database, this.query, values.map(normalize));
  }

  async all() {
    const results = this.database.prepare(this.query).all(...this.values);
    return { success: true, results };
  }

  async first(columnName) {
    const row = this.database.prepare(this.query).get(...this.values) ?? null;
    return columnName && row ? row[columnName] ?? null : row;
  }

  async run() {
    return this.runSync();
  }

  runSync() {
    const result = this.database.prepare(this.query).run(...this.values);
    return {
      success: true,
      results: [],
      meta: {
        changes: Number(result.changes ?? 0),
        last_row_id: Number(result.lastInsertRowid ?? 0),
      },
    };
  }
}

export async function createSQLiteD1() {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");
  const migrationDirectory = new URL("../../drizzle/", import.meta.url);
  const names = (await readdir(migrationDirectory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const sql = await readFile(new URL(name, migrationDirectory), "utf8");
    for (const statement of sql.split("--> statement-breakpoint").map((part) => part.trim()).filter(Boolean)) {
      database.exec(statement);
    }
  }

  return {
    database,
    prepare(query) {
      return new SQLiteD1Statement(database, query);
    },
    async batch(statements) {
      database.exec("BEGIN IMMEDIATE");
      try {
        const results = statements.map((statement) => statement.runSync());
        database.exec("COMMIT");
        return results;
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    },
    close() {
      database.close();
    },
  };
}
