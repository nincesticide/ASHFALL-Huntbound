const ROOM_PATTERN = /^[A-Z0-9]{4,8}$/;
const MAX_EVENT_BYTES = 220_000;
const EVENT_TTL_MS = 2 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanupAt = 0;

type MultiplayerEnv = {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function roomCodeFrom(url: URL) {
  const room = (url.searchParams.get("room") ?? "").trim().toUpperCase();
  return ROOM_PATTERN.test(room) ? room : null;
}

export async function handleMultiplayerRequest(
  request: Request,
  db: MultiplayerEnv | undefined,
) {
  if (!db) return json({ error: "Multiplayer relay unavailable" }, { status: 503 });

  const url = new URL(request.url);
  if (request.method === "GET") {
    const room = roomCodeFrom(url);
    if (!room) return json({ error: "Invalid room code" }, { status: 400 });
    const since = Math.max(0, Number.parseInt(url.searchParams.get("since") ?? "0", 10) || 0);
    const result = await db
      .prepare(
        "SELECT id, payload FROM multiplayer_events WHERE room_code = ? AND id > ? ORDER BY id ASC LIMIT 200",
      )
      .bind(room, since)
      .all<{ id: number; payload: string }>();
    const events = (result.results ?? []).flatMap((row) => {
      try {
        return [{ id: row.id, event: JSON.parse(row.payload) }];
      } catch {
        return [];
      }
    });
    return json({ events, cursor: events.at(-1)?.id ?? since });
  }

  if (request.method === "POST") {
    let body: { room?: string; event?: unknown };
    try {
      body = (await request.json()) as { room?: string; event?: unknown };
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }
    const room = (body.room ?? "").trim().toUpperCase();
    if (!ROOM_PATTERN.test(room) || !body.event || typeof body.event !== "object") {
      return json({ error: "Invalid multiplayer event" }, { status: 400 });
    }
    const payload = JSON.stringify(body.event);
    if (new TextEncoder().encode(payload).byteLength > MAX_EVENT_BYTES) {
      return json({ error: "Event too large" }, { status: 413 });
    }
    const event = body.event as { _senderPeerId?: unknown };
    const sender = typeof event._senderPeerId === "string" ? event._senderPeerId.slice(0, 80) : "unknown";
    const now = Date.now();
    const statements = [
      db.prepare(
        "INSERT INTO multiplayer_events (room_code, sender_peer_id, payload, created_at) VALUES (?, ?, ?, ?)",
      ).bind(room, sender, payload, now),
    ];
    const shouldClean = now - lastCleanupAt >= CLEANUP_INTERVAL_MS;
    if (shouldClean) {
      statements.push(
        db.prepare("DELETE FROM multiplayer_events WHERE created_at < ?").bind(now - EVENT_TTL_MS),
      );
    }
    await db.batch(statements);
    if (shouldClean) lastCleanupAt = now;
    return json({ ok: true }, { status: 201 });
  }

  return json({ error: "Method not allowed" }, { status: 405, headers: { allow: "GET, POST" } });
}
