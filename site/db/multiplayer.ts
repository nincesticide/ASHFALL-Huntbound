const ROOM_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;
const PEER_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;
const CHARACTER_PATTERN = /^[A-Za-z0-9_-]{8,120}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,96}$/;
const PROTOCOL_NAME = "ashfall-room";
const PROTOCOL_VERSION = 2;
const MAX_SNAPSHOT_BYTES = 220_000;
const MAX_EVENT_BYTES = 48_000;
const MAX_REQUEST_BYTES = 240_000;
const EVENT_TTL_MS = 2 * 60 * 60 * 1000;
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const HOST_LEASE_MS = 20_000;
const MEMBER_ACTIVE_MS = 60_000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
const MAX_SEQUENCE_GAP = 256;
let lastCleanupAt = 0;

const HOST_EVENT_TYPES = new Set([
  "snapshot", "reject", "worldRewardV141", "worldDelveDiscoveredV141",
  "worldNoticeV141", "settlement", "authorityNoticeV147",
]);

const MEMBER_EVENT_TYPES = new Set([
  "join", "profileSync", "campMove", "worldMoveV14", "worldInteractV141",
  "enterWorldV14", "leaveWorldV14", "returnToCampV142", "campPrep",
  "campMerchantPrep", "leave", "reconnectV147", "command", "quickActionV132",
  "cancelActionV131", "ready", "vote",
]);

type MultiplayerEnv = {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
};

type RoomRow = {
  roomCode: string;
  roomSessionId: string;
  hostPeerId: string;
  hostUserId: string;
  inviteTokenHash: string;
  protocolVersion: number;
  authorityEpoch: number;
  leaseExpiresAt: number;
  snapshotJson: string | null;
  snapshotVersion: number;
  snapshotEventCursor: number;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

type MemberRow = {
  roomCode: string;
  roomSessionId: string;
  peerId: string;
  userId: string;
  characterId: string;
  tokenHash: string;
  joinedAt: number;
  lastSeenAt: number;
  lastClientSeq: number;
};

type ProtocolEnvelope = {
  protocol: string;
  protocolVersion: number;
  roomCode: string;
  roomSessionId: string;
  eventId: string;
  peerId: string;
  clientSeq: number;
  authorityEpoch: number;
  kind: string;
  sentAt: number;
  payload: Record<string, unknown>;
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function roomCode(value: unknown) {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
  return ROOM_PATTERN.test(normalized) ? normalized : null;
}

function peerId(value: unknown) {
  return typeof value === "string" && PEER_PATTERN.test(value) ? value : null;
}

function characterId(value: unknown) {
  return typeof value === "string" && CHARACTER_PATTERN.test(value) ? value : null;
}

function requestToken(request: Request) {
  const token = request.headers.get("x-ashfall-member-token") ?? "";
  return TOKEN_PATTERN.test(token) ? token : null;
}

function requestSessionId(request: Request) {
  const value = request.headers.get("x-ashfall-room-session") ?? "";
  return TOKEN_PATTERN.test(value) ? value : null;
}

function sameOriginRequest(request: Request, url: URL) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === url.origin; } catch { return false; }
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function authenticatedUserId(request: Request, url: URL) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (email) return `oai:${await sha256(email)}`;
  if (["localhost", "127.0.0.1", "terminal.local"].includes(url.hostname)) {
    const fixture = request.headers.get("x-ashfall-test-user")?.trim() || "local-player";
    return `dev:${await sha256(fixture)}`;
  }
  return null;
}

function parseSnapshot(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch { return null; }
}

function roomSelectSql() {
  return `SELECT room_code AS roomCode, room_session_id AS roomSessionId,
    host_peer_id AS hostPeerId,
    host_user_id AS hostUserId, invite_token_hash AS inviteTokenHash,
    protocol_version AS protocolVersion, authority_epoch AS authorityEpoch,
    lease_expires_at AS leaseExpiresAt, snapshot_json AS snapshotJson,
    snapshot_version AS snapshotVersion, snapshot_event_cursor AS snapshotEventCursor,
    created_at AS createdAt,
    updated_at AS updatedAt, expires_at AS expiresAt
    FROM multiplayer_rooms WHERE room_code = ?`;
}

async function readRoom(db: MultiplayerEnv, code: string) {
  return db.prepare(roomSelectSql()).bind(code).first<RoomRow>();
}

async function eventCursor(db: MultiplayerEnv, sessionId: string) {
  const row = await db.prepare("SELECT COALESCE(MAX(id), 0) AS cursor FROM multiplayer_events WHERE room_session_id = ?")
    .bind(sessionId).first<{ cursor: number }>();
  return Number(row?.cursor ?? 0);
}

async function activeSuccessor(db: MultiplayerEnv, room: RoomRow, now: number) {
  const row = await db.prepare(
    `SELECT peer_id AS peerId FROM multiplayer_members
     WHERE room_session_id = ? AND peer_id <> ? AND last_seen_at >= ?
     ORDER BY joined_at ASC, peer_id ASC LIMIT 1`,
  ).bind(room.roomSessionId, room.hostPeerId, now - MEMBER_ACTIVE_MS).first<{ peerId: string }>();
  return row?.peerId ?? null;
}

async function authorityPayload(db: MultiplayerEnv, room: RoomRow, now: number, includeSnapshot = false) {
  const leaseExpired = room.leaseExpiresAt <= now;
  return {
    protocolVersion: room.protocolVersion,
    roomSessionId: room.roomSessionId,
    hostPeerId: room.hostPeerId,
    authorityEpoch: room.authorityEpoch,
    leaseExpiresAt: room.leaseExpiresAt,
    leaseExpired,
    candidatePeerId: leaseExpired ? await activeSuccessor(db, room, now) : null,
    snapshotVersion: room.snapshotVersion,
    snapshotEventCursor: room.snapshotEventCursor,
    snapshot: includeSnapshot ? parseSnapshot(room.snapshotJson) : undefined,
  };
}

async function authorizeMember(request: Request, db: MultiplayerEnv, userId: string, code: string, id: string) {
  const token = requestToken(request);
  const sessionId = requestSessionId(request);
  if (!token || !sessionId) return null;
  const tokenHash = await sha256(token);
  return db.prepare(
    `SELECT room_code AS roomCode, room_session_id AS roomSessionId,
     peer_id AS peerId, user_id AS userId, character_id AS characterId,
     token_hash AS tokenHash, joined_at AS joinedAt, last_seen_at AS lastSeenAt,
     last_client_seq AS lastClientSeq FROM multiplayer_members
     WHERE room_code = ? AND room_session_id = ? AND peer_id = ?
     AND user_id = ? AND token_hash = ?`,
  ).bind(code, sessionId, id, userId, tokenHash).first<MemberRow>();
}

function runChanges(result: D1Result<unknown> | undefined) {
  const meta = result?.meta as { changes?: number } | undefined;
  return Number(meta?.changes ?? 0);
}

function validSafeName(value: unknown) {
  return typeof value === "string" && value.trim().length >= 1 && value.trim().length <= 24 &&
    !/[<>&"'\u0000-\u001f\u007f]/u.test(value);
}

function validCardinalMove(payload: Record<string, unknown>) {
  return Number.isInteger(payload.dx) && Number.isInteger(payload.dy) &&
    Math.abs(Number(payload.dx)) + Math.abs(Number(payload.dy)) === 1;
}

function validateEventPayload(envelope: ProtocolEnvelope) {
  const payload = envelope.payload;
  if (payload.type !== envelope.kind) return "Envelope kind does not match payload type";
  if (payload.peerId != null && payload.peerId !== envelope.peerId && !HOST_EVENT_TYPES.has(envelope.kind)) {
    return "Sender does not match claimed peer";
  }
  if (["join", "profileSync", "reconnectV147"].includes(envelope.kind)) {
    const player = payload.player;
    if (!player || typeof player !== "object") return "Player payload is required";
    const record = player as Record<string, unknown>;
    if (record.peerId !== envelope.peerId || !characterId(record.characterId) || !validSafeName(record.name)) return "Invalid player identity";
  }
  if (["campMove", "worldMoveV14"].includes(envelope.kind) && !validCardinalMove(payload)) {
    return "Movement must be one cardinal tile";
  }
  if (envelope.kind === "campMerchantPrep" &&
      (!Number.isInteger(payload.qty) || Number(payload.qty) < 1 || Number(payload.qty) > 4)) {
    return "Invalid preparation quantity";
  }
  if (envelope.kind === "command") {
    const action = payload.action;
    if (!action || typeof action !== "object") return "Command action is required";
    const record = action as Record<string, unknown>;
    if (!["attack", "skill1", "skill2", "guard", "potion", "revive", "move", "secure"].includes(String(record.type))) {
      return "Unsupported command action";
    }
    if (record.type === "move" && !validCardinalMove(record)) return "Combat movement must be one cardinal tile";
  }
  if (envelope.kind === "vote" && !["extract", "descend"].includes(String(payload.vote))) return "Invalid extraction vote";
  if (envelope.kind === "ready" && typeof payload.ready !== "boolean") return "Invalid ready state";
  if (envelope.kind === "snapshot") {
    const room = payload.room;
    if (!room || typeof room !== "object") return "Snapshot room is required";
    const record = room as Record<string, unknown>;
    if (record.code !== envelope.roomCode || record.hostPeerId !== envelope.peerId) return "Snapshot authority does not match its sender";
    const players = record.players;
    if (!players || typeof players !== "object" || Object.keys(players).length < 1 || Object.keys(players).length > 4) {
      return "Snapshot party size is invalid";
    }
    for (const [key, value] of Object.entries(players)) {
      if (!peerId(key) || !value || typeof value !== "object") return "Snapshot player is invalid";
      const player = value as Record<string, unknown>;
      if (player.peerId !== key || !characterId(player.characterId) || !validSafeName(player.name)) return "Snapshot player identity is invalid";
    }
  }
  return null;
}

function validJsonTree(value: unknown, depth = 0, budget = { nodes: 0 }): boolean {
  if (++budget.nodes > 25_000 || depth > 36) return false;
  if (value == null || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= 12_000;
  if (Array.isArray(value)) return value.length <= 2_000 && value.every((item) => validJsonTree(item, depth + 1, budget));
  if (typeof value !== "object") return false;
  const entries = Object.entries(value as Record<string, unknown>);
  return entries.length <= 2_000 && entries.every(([key, item]) =>
    key.length <= 160 && !["__proto__", "prototype", "constructor"].includes(key) && validJsonTree(item, depth + 1, budget));
}

function validateEnvelope(value: unknown, code: string, sessionId: string, id: string) {
  if (!value || typeof value !== "object") return { envelope: null, error: "Protocol envelope is required" };
  if (!validJsonTree(value)) return { envelope: null, error: "Unsafe or excessively complex multiplayer payload" };
  const envelope = value as Partial<ProtocolEnvelope>;
  if (envelope.protocol !== PROTOCOL_NAME || envelope.protocolVersion !== PROTOCOL_VERSION) return { envelope: null, error: "Unsupported multiplayer protocol" };
  if (envelope.roomCode !== code || envelope.roomSessionId !== sessionId || envelope.peerId !== id) {
    return { envelope: null, error: "Envelope room, session, or sender mismatch" };
  }
  if (typeof envelope.eventId !== "string" || envelope.eventId.length < 12 || envelope.eventId.length > 160 ||
      !Number.isSafeInteger(envelope.clientSeq) || Number(envelope.clientSeq) < 1 ||
      !Number.isSafeInteger(envelope.authorityEpoch) || Number(envelope.authorityEpoch) < 1 ||
      typeof envelope.kind !== "string" ||
      (!HOST_EVENT_TYPES.has(envelope.kind) && !MEMBER_EVENT_TYPES.has(envelope.kind)) ||
      !envelope.payload || typeof envelope.payload !== "object") {
    return { envelope: null, error: "Malformed multiplayer envelope" };
  }
  const typed = envelope as ProtocolEnvelope;
  return { envelope: typed, error: validateEventPayload(typed) };
}

async function cleanupExpired(db: MultiplayerEnv, now: number) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  await db.batch([
    db.prepare("DELETE FROM multiplayer_events WHERE created_at < ?").bind(now - EVENT_TTL_MS),
    db.prepare("DELETE FROM multiplayer_members WHERE room_code IN (SELECT room_code FROM multiplayer_rooms WHERE expires_at < ?)").bind(now),
    db.prepare("DELETE FROM multiplayer_events WHERE room_code IN (SELECT room_code FROM multiplayer_rooms WHERE expires_at < ?)").bind(now),
    db.prepare("DELETE FROM multiplayer_rooms WHERE expires_at < ?").bind(now),
  ]);
  lastCleanupAt = now;
}

async function handleOpen(request: Request, db: MultiplayerEnv, userId: string, body: Record<string, unknown>, now: number) {
  const code = roomCode(body.room);
  const id = peerId(body.peerId);
  const selectedCharacterId = characterId(body.characterId);
  const mode = body.mode;
  if (!code || !id || !selectedCharacterId || !["create", "join", "resume"].includes(String(mode))) return json({ error: "Invalid room open request" }, { status: 400 });

  if (mode === "create") {
    const existing = await readRoom(db, code);
    if (existing && existing.expiresAt >= now) return json({ error: "Room code already exists" }, { status: 409 });
    if (existing) await db.batch([
      db.prepare("DELETE FROM multiplayer_members WHERE room_code = ?").bind(code),
      db.prepare("DELETE FROM multiplayer_events WHERE room_code = ?").bind(code),
      db.prepare("DELETE FROM multiplayer_rooms WHERE room_code = ?").bind(code),
    ]);
    const memberToken = randomToken();
    const inviteToken = randomToken(24);
    const roomSessionId = randomToken(24);
    try {
      await db.batch([
        db.prepare(
          `INSERT INTO multiplayer_rooms (room_code, room_session_id, host_peer_id, host_user_id,
           invite_token_hash, status, protocol_version, authority_epoch, lease_expires_at,
           snapshot_json, snapshot_version, snapshot_event_cursor, created_at, updated_at, expires_at)
           VALUES (?, ?, ?, ?, ?, 'active', ?, 1, ?, NULL, 0, 0, ?, ?, ?)`,
        ).bind(code, roomSessionId, id, userId, await sha256(inviteToken), PROTOCOL_VERSION, now + HOST_LEASE_MS, now, now, now + ROOM_TTL_MS),
        db.prepare(
          `INSERT INTO multiplayer_members (room_code, room_session_id, peer_id, user_id,
           character_id, token_hash, joined_at, last_seen_at, last_client_seq) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        ).bind(code, roomSessionId, id, userId, selectedCharacterId, await sha256(memberToken), now, now),
      ]);
    } catch { return json({ error: "Room code already exists" }, { status: 409 }); }
    const room = await readRoom(db, code);
    if (!room) return json({ error: "Room creation failed" }, { status: 500 });
    return json({ ok: true, memberToken, inviteToken, lastClientSeq: 0, cursor: 0,
      authority: await authorityPayload(db, room, now, true) }, { status: 201 });
  }

  if (mode === "resume") {
    const room = await readRoom(db, code);
    if (!room || room.expiresAt < now) return json({ error: "Room expired" }, { status: 404 });
    const member = await authorizeMember(request, db, userId, code, id);
    if (!member) return json({ error: "Reconnect token rejected" }, { status: 401 });
    if (member.characterId !== selectedCharacterId) return json({ error: "Reconnect belongs to another hunter" }, { status: 409 });
    const rotatedMemberToken = randomToken();
    const statements = [db.prepare("UPDATE multiplayer_members SET token_hash = ?, last_seen_at = ? WHERE room_session_id = ? AND peer_id = ?").bind(await sha256(rotatedMemberToken), now, room.roomSessionId, id)];
    if (room.hostPeerId === id) statements.push(db.prepare("UPDATE multiplayer_rooms SET lease_expires_at = ?, updated_at = ?, expires_at = ? WHERE room_code = ? AND host_peer_id = ? AND authority_epoch = ?").bind(now + HOST_LEASE_MS, now, now + ROOM_TTL_MS, code, id, room.authorityEpoch));
    await db.batch(statements);
    const refreshed = await readRoom(db, code);
    return json({ ok: true, memberToken: rotatedMemberToken, lastClientSeq: member.lastClientSeq, cursor: room.snapshotEventCursor,
      authority: refreshed ? await authorityPayload(db, refreshed, now, true) : null });
  }

  const room = await readRoom(db, code);
  if (!room || room.expiresAt < now) return json({ error: "Room not found" }, { status: 404 });
  if (snapshotNeedsSameHost(room)) return json({ error: "The party is already in the field" }, { status: 409 });
  const count = await db.prepare("SELECT COUNT(*) AS count FROM multiplayer_members WHERE room_session_id = ?").bind(room.roomSessionId).first<{ count: number }>();
  if (Number(count?.count ?? 0) >= 4) return json({ error: "Party is full" }, { status: 409 });
  const duplicate = await db.prepare("SELECT user_id AS userId FROM multiplayer_members WHERE room_session_id = ? AND peer_id = ?").bind(room.roomSessionId, id).first<{ userId: string }>();
  if (duplicate) return json({ error: "Existing member must reconnect" }, { status: 409 });
  const suppliedInvite = typeof body.inviteToken === "string" ? body.inviteToken : "";
  if (room.hostUserId !== userId && (!TOKEN_PATTERN.test(suppliedInvite) || await sha256(suppliedInvite) !== room.inviteTokenHash)) {
    return json({ error: "Invite token rejected" }, { status: 403 });
  }
  const memberToken = randomToken();
  const inserted = await db.prepare(
    `INSERT INTO multiplayer_members (room_code, room_session_id, peer_id, user_id,
     character_id, token_hash, joined_at, last_seen_at, last_client_seq)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, 0 WHERE
       (SELECT COUNT(*) FROM multiplayer_members WHERE room_session_id = ?) < 4`,
  ).bind(code, room.roomSessionId, id, userId, selectedCharacterId, await sha256(memberToken), now, now, room.roomSessionId).run();
  if (runChanges(inserted) !== 1) return json({ error: "Party is full" }, { status: 409 });
  await db.prepare("UPDATE multiplayer_rooms SET updated_at = ?, expires_at = ? WHERE room_code = ?").bind(now, now + ROOM_TTL_MS, code).run();
  const refreshed = await readRoom(db, code);
  return json({ ok: true, memberToken, lastClientSeq: 0, cursor: await eventCursor(db, room.roomSessionId),
    authority: refreshed ? await authorityPayload(db, refreshed, now, true) : null }, { status: 201 });
}

async function handleGet(request: Request, db: MultiplayerEnv, userId: string, url: URL, now: number) {
  const code = roomCode(url.searchParams.get("room"));
  const id = peerId(request.headers.get("x-ashfall-peer-id"));
  if (!code || !id) return json({ error: "Invalid room cursor request" }, { status: 400 });
  const member = await authorizeMember(request, db, userId, code, id);
  if (!member) return json({ error: "Room membership required" }, { status: 401 });
  const room = await readRoom(db, code);
  if (!room || room.expiresAt < now) return json({ error: "Room expired" }, { status: 404 });
  const since = Math.max(0, Number.parseInt(url.searchParams.get("since") ?? "0", 10) || 0);
  const knownSnapshot = Math.max(0, Number.parseInt(url.searchParams.get("snapshot") ?? "0", 10) || 0);
  const result = await db.prepare(
    `SELECT id, payload FROM multiplayer_events WHERE room_session_id = ? AND id > ?
     AND protocol_version = ? ORDER BY id ASC LIMIT 200`,
  ).bind(room.roomSessionId, since, PROTOCOL_VERSION).all<{ id: number; payload: string }>();
  const rows = result.results ?? [];
  const events = rows.flatMap((row) => { try { return [{ id: row.id, event: JSON.parse(row.payload) }]; } catch { return []; } });
  return json({ events, cursor: rows.at(-1)?.id ?? since,
    authority: await authorityPayload(db, room, now, room.snapshotVersion > knownSnapshot) });
}

async function handleHeartbeat(request: Request, db: MultiplayerEnv, userId: string, code: string, id: string, now: number) {
  if (!await authorizeMember(request, db, userId, code, id)) return json({ error: "Room membership required" }, { status: 401 });
  const room = await readRoom(db, code);
  if (!room || room.expiresAt < now) return json({ error: "Room expired" }, { status: 404 });
  const statements = [
    db.prepare("UPDATE multiplayer_members SET last_seen_at = ? WHERE room_session_id = ? AND peer_id = ?").bind(now, room.roomSessionId, id),
  ];
  if (room.hostPeerId === id) statements.push(
    db.prepare("UPDATE multiplayer_rooms SET lease_expires_at = ?, updated_at = ?, expires_at = ? WHERE room_code = ? AND host_peer_id = ? AND authority_epoch = ?")
      .bind(now + HOST_LEASE_MS, now, now + ROOM_TTL_MS, code, id, room.authorityEpoch),
  );
  await db.batch(statements);
  const refreshed = (await readRoom(db, code)) ?? room;
  return json({ ok: true, authority: await authorityPayload(db, refreshed, now, false) });
}

function snapshotNeedsSameHost(room: RoomRow) {
  const snapshot = parseSnapshot(room.snapshotJson) as { run?: unknown; worldV14?: unknown } | null;
  return Boolean(snapshot?.run || snapshot?.worldV14);
}

async function handleClaim(request: Request, db: MultiplayerEnv, userId: string, code: string, id: string, now: number) {
  if (!await authorizeMember(request, db, userId, code, id)) return json({ error: "Room membership required" }, { status: 401 });
  const room = await readRoom(db, code);
  if (!room) return json({ error: "Room not found" }, { status: 404 });
  if (room.hostPeerId === id) return json({ ok: true, claimed: false, authority: await authorityPayload(db, room, now, true) });
  if (room.leaseExpiresAt > now) return json({ error: "Host lease is still active" }, { status: 409 });
  if (snapshotNeedsSameHost(room)) return json({ error: "Active field state requires the same host to reconnect", recoveryRequired: true }, { status: 409 });
  if (await activeSuccessor(db, room, now) !== id) return json({ error: "Another member owns the recovery claim" }, { status: 409 });
  const result = await db.prepare(
    `UPDATE multiplayer_rooms SET host_peer_id = ?, host_user_id = ?,
     authority_epoch = authority_epoch + 1, lease_expires_at = ?, updated_at = ?, expires_at = ?
     WHERE room_code = ? AND authority_epoch = ? AND lease_expires_at <= ?`,
  ).bind(id, userId, now + HOST_LEASE_MS, now, now + ROOM_TTL_MS, code, room.authorityEpoch, now).run();
  if (runChanges(result) !== 1) return json({ error: "Authority claim lost" }, { status: 409 });
  const refreshed = await readRoom(db, code);
  return json({ ok: true, claimed: true, authority: refreshed ? await authorityPayload(db, refreshed, now, true) : null });
}

async function handleLeave(request: Request, db: MultiplayerEnv, userId: string, code: string, id: string, now: number) {
  if (!await authorizeMember(request, db, userId, code, id)) return json({ error: "Room membership required" }, { status: 401 });
  const room = await readRoom(db, code);
  if (!room) return json({ ok: true, closed: true });
  if (room.hostPeerId === id && snapshotNeedsSameHost(room)) {
    await db.batch([
      db.prepare("DELETE FROM multiplayer_members WHERE room_session_id = ?").bind(room.roomSessionId),
      db.prepare("DELETE FROM multiplayer_events WHERE room_session_id = ?").bind(room.roomSessionId),
      db.prepare("DELETE FROM multiplayer_rooms WHERE room_code = ?").bind(code),
    ]);
    return json({ ok: true, closed: true, recoveryRequired: false });
  }
  await db.prepare("DELETE FROM multiplayer_members WHERE room_session_id = ? AND peer_id = ?").bind(room.roomSessionId, id).run();
  const remaining = await db.prepare("SELECT COUNT(*) AS count FROM multiplayer_members WHERE room_session_id = ?").bind(room.roomSessionId).first<{ count: number }>();
  if (Number(remaining?.count ?? 0) === 0) {
    await db.batch([
      db.prepare("DELETE FROM multiplayer_events WHERE room_code = ?").bind(code),
      db.prepare("DELETE FROM multiplayer_rooms WHERE room_code = ?").bind(code),
    ]);
    return json({ ok: true, closed: true });
  }
  if (room.hostPeerId === id) {
    const next = await db.prepare(
      "SELECT peer_id AS peerId, user_id AS userId FROM multiplayer_members WHERE room_session_id = ? ORDER BY joined_at ASC, peer_id ASC LIMIT 1",
    ).bind(room.roomSessionId).first<{ peerId: string; userId: string }>();
    if (next) await db.prepare(
      `UPDATE multiplayer_rooms SET host_peer_id = ?, host_user_id = ?, authority_epoch = authority_epoch + 1,
       lease_expires_at = ?, updated_at = ?, expires_at = ? WHERE room_code = ?`,
    ).bind(next.peerId, next.userId, now + HOST_LEASE_MS, now, now + ROOM_TTL_MS, code).run();
  } else await db.prepare("UPDATE multiplayer_rooms SET updated_at = ?, expires_at = ? WHERE room_code = ?").bind(now, now + ROOM_TTL_MS, code).run();
  const refreshed = await readRoom(db, code);
  return json({ ok: true, closed: false, authority: refreshed ? await authorityPayload(db, refreshed, now, true) : null });
}

async function handleEvent(request: Request, db: MultiplayerEnv, userId: string, body: Record<string, unknown>, now: number) {
  const code = roomCode(body.room);
  const id = peerId(body.peerId);
  if (!code || !id) return json({ error: "Invalid event sender" }, { status: 400 });
  const member = await authorizeMember(request, db, userId, code, id);
  if (!member) return json({ error: "Room membership required" }, { status: 401 });
  const room = await readRoom(db, code);
  if (!room || room.expiresAt < now) return json({ error: "Room expired" }, { status: 404 });
  const checked = validateEnvelope(body.envelope, code, room.roomSessionId, id);
  if (!checked.envelope || checked.error) return json({ error: checked.error }, { status: 400 });
  const envelope = checked.envelope;
  const isRoomHost = room.hostPeerId === id;
  if (["join", "profileSync", "reconnectV147"].includes(envelope.kind)) {
    const player = envelope.payload.player as Record<string, unknown>;
    if (player.characterId !== member.characterId) return json({ error: "Hunter identity changed during the room session" }, { status: 403 });
  }
  if (envelope.authorityEpoch !== room.authorityEpoch) return json({ error: "Stale authority epoch" }, { status: 409 });
  if (HOST_EVENT_TYPES.has(envelope.kind) && !isRoomHost) return json({ error: "Host authority required" }, { status: 403 });
  if (envelope.clientSeq !== member.lastClientSeq + 1 || envelope.clientSeq > member.lastClientSeq + MAX_SEQUENCE_GAP) {
    return json({ error: "Duplicate, stale, or invalid event sequence", expectedAfter: member.lastClientSeq }, { status: 409 });
  }
  let statements: D1PreparedStatement[];
  if (envelope.kind === "snapshot") {
    const snapshotRoom = envelope.payload.room as Record<string, unknown>;
    const stateVersion = Number(envelope.payload.stateVersion ?? snapshotRoom.stateVersionV146);
    if (!Number.isSafeInteger(stateVersion) || stateVersion < 1) return json({ error: "Snapshot version is required" }, { status: 400 });
    if (stateVersion !== room.snapshotVersion + 1) return json({ error: "Snapshot version must advance exactly once" }, { status: 409 });
    snapshotRoom.authorityEpochV147 = room.authorityEpoch;
    snapshotRoom.protocolVersionV147 = PROTOCOL_VERSION;
    const snapshotJson = JSON.stringify(snapshotRoom);
    const payload = JSON.stringify(envelope);
    if (new TextEncoder().encode(snapshotJson).byteLength > MAX_SNAPSHOT_BYTES || new TextEncoder().encode(payload).byteLength > MAX_SNAPSHOT_BYTES) return json({ error: "Snapshot too large" }, { status: 413 });
    const members = await db.prepare("SELECT peer_id AS peerId, character_id AS characterId FROM multiplayer_members WHERE room_session_id = ?")
      .bind(room.roomSessionId).all<{ peerId: string; characterId: string }>();
    const memberCharacters = new Map((members.results ?? []).map((entry) => [entry.peerId, entry.characterId]));
    for (const [snapshotPeerId, value] of Object.entries(snapshotRoom.players as Record<string, Record<string, unknown>>)) {
      if (memberCharacters.get(snapshotPeerId) !== value.characterId) return json({ error: "Snapshot hunter membership mismatch" }, { status: 403 });
    }
    const checkpointCursor = await eventCursor(db, room.roomSessionId);
    statements = [
      db.prepare(
        `UPDATE multiplayer_rooms SET snapshot_json = ?, snapshot_version = ?, snapshot_event_cursor = ?, lease_expires_at = ?,
         updated_at = ?, expires_at = ? WHERE room_code = ? AND host_peer_id = ?
         AND authority_epoch = ? AND snapshot_version = ? AND EXISTS (
           SELECT 1 FROM multiplayer_members WHERE room_session_id = ? AND peer_id = ?
           AND user_id = ? AND token_hash = ? AND last_client_seq = ?
         )`,
      ).bind(snapshotJson, stateVersion, checkpointCursor, now + HOST_LEASE_MS, now, now + ROOM_TTL_MS,
        code, id, room.authorityEpoch, room.snapshotVersion, room.roomSessionId, id, userId, member.tokenHash, member.lastClientSeq),
      db.prepare(
        `INSERT INTO multiplayer_events (room_code, room_session_id, sender_peer_id, sender_user_id, event_id,
         protocol_version, authority_epoch, client_seq, payload, created_at)
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (
           SELECT 1 FROM multiplayer_rooms WHERE room_code = ? AND host_peer_id = ?
           AND authority_epoch = ? AND snapshot_version = ?
         ) AND EXISTS (
           SELECT 1 FROM multiplayer_members WHERE room_session_id = ? AND peer_id = ?
           AND user_id = ? AND token_hash = ? AND last_client_seq = ?
         )`,
      ).bind(code, room.roomSessionId, id, userId, envelope.eventId, PROTOCOL_VERSION, envelope.authorityEpoch,
        envelope.clientSeq, payload, now, code, id, room.authorityEpoch, stateVersion,
        room.roomSessionId, id, userId, member.tokenHash, member.lastClientSeq),
      db.prepare(
        `UPDATE multiplayer_members SET last_client_seq = ?, last_seen_at = ?
         WHERE room_session_id = ? AND peer_id = ? AND last_client_seq = ? AND EXISTS (
           SELECT 1 FROM multiplayer_events WHERE room_session_id = ? AND event_id = ?
         )`,
      ).bind(envelope.clientSeq, now, room.roomSessionId, id, member.lastClientSeq, room.roomSessionId, envelope.eventId),
    ];
  } else {
    const payload = JSON.stringify(envelope);
    if (new TextEncoder().encode(payload).byteLength > MAX_EVENT_BYTES) return json({ error: "Event too large" }, { status: 413 });
    statements = [
      db.prepare(
        `INSERT INTO multiplayer_events (room_code, room_session_id, sender_peer_id, sender_user_id, event_id,
         protocol_version, authority_epoch, client_seq, payload, created_at)
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (
           SELECT 1 FROM multiplayer_members WHERE room_session_id = ? AND peer_id = ?
           AND user_id = ? AND token_hash = ? AND last_client_seq = ?
         )`,
      ).bind(code, room.roomSessionId, id, userId, envelope.eventId, PROTOCOL_VERSION, envelope.authorityEpoch,
        envelope.clientSeq, payload, now, room.roomSessionId, id, userId, member.tokenHash, member.lastClientSeq),
      db.prepare(
        `UPDATE multiplayer_members SET last_client_seq = ?, last_seen_at = ?
         WHERE room_session_id = ? AND peer_id = ? AND last_client_seq = ? AND EXISTS (
           SELECT 1 FROM multiplayer_events WHERE room_session_id = ? AND event_id = ?
         )`,
      ).bind(envelope.clientSeq, now, room.roomSessionId, id, member.lastClientSeq, room.roomSessionId, envelope.eventId),
      isRoomHost
        ? db.prepare("UPDATE multiplayer_rooms SET lease_expires_at = ?, updated_at = ?, expires_at = ? WHERE room_code = ? AND host_peer_id = ? AND authority_epoch = ?")
          .bind(now + HOST_LEASE_MS, now, now + ROOM_TTL_MS, code, id, room.authorityEpoch)
        : db.prepare("UPDATE multiplayer_rooms SET updated_at = ?, expires_at = ? WHERE room_code = ?")
          .bind(now, now + ROOM_TTL_MS, code),
    ];
  }
  let results: D1Result<unknown>[];
  try { results = await db.batch(statements); }
  catch { return json({ error: "Duplicate or conflicting multiplayer event" }, { status: 409 }); }
  if (results.slice(0, envelope.kind === "snapshot" ? 3 : 2).some((result) => runChanges(result) !== 1)) return json({ error: "Event sequence or checkpoint was not accepted" }, { status: 409 });
  return json({ ok: true, ack: { eventId: envelope.eventId, clientSeq: envelope.clientSeq } }, { status: 201 });
}

export async function handleMultiplayerRequest(request: Request, db: MultiplayerEnv | undefined) {
  if (!db) return json({ error: "Multiplayer authority unavailable" }, { status: 503 });
  const url = new URL(request.url);
  if (!sameOriginRequest(request, url)) return json({ error: "Cross-origin request rejected" }, { status: 403 });
  const userId = await authenticatedUserId(request, url);
  if (!userId) return json({ error: "ChatGPT sign-in required" }, { status: 401 });
  const now = Date.now();
  await cleanupExpired(db, now);
  if (request.method === "GET") return handleGet(request, db, userId, url, now);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405, headers: { allow: "GET, POST" } });
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return json({ error: "JSON content type required" }, { status: 415 });
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) return json({ error: "Request too large" }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) return json({ error: "Request too large" }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
  }
  catch { return json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object") return json({ error: "Invalid request body" }, { status: 400 });
  if (body.op === "open") return handleOpen(request, db, userId, body, now);
  const code = roomCode(body.room);
  const id = peerId(body.peerId);
  if (!code || !id) return json({ error: "Invalid room member" }, { status: 400 });
  if (body.op === "event") return handleEvent(request, db, userId, body, now);
  if (body.op === "heartbeat") return handleHeartbeat(request, db, userId, code, id, now);
  if (body.op === "claim") return handleClaim(request, db, userId, code, id, now);
  if (body.op === "leave") return handleLeave(request, db, userId, code, id, now);
  return json({ error: "Unsupported multiplayer operation" }, { status: 400 });
}
