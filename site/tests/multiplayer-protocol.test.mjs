import assert from "node:assert/strict";
import test from "node:test";
import { createSQLiteD1 } from "./helpers/sqlite-d1.mjs";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("multiplayer-test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const executionContext = { waitUntil() {}, passThroughOnException() {} };
const PEERS = {
  host: "host-peer-0001",
  guest: "guest-peer-001",
  outsider: "outsider-peer-1",
};
const CHARACTERS = {
  host: "hunter_11111111111111111111111111111111",
  guest: "hunter_22222222222222222222222222222222",
};

function environment(database) {
  return { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) }, DB: database };
}

function requestHeaders(user, session) {
  const headers = { "content-type": "application/json", "x-ashfall-test-user": user };
  if (session) {
    headers["x-ashfall-peer-id"] = session.peerId;
    headers["x-ashfall-member-token"] = session.memberToken;
    headers["x-ashfall-room-session"] = session.roomSessionId;
  }
  return headers;
}

async function post(database, user, body, session) {
  return worker.fetch(new Request("http://localhost/api/multiplayer", {
    method: "POST",
    headers: requestHeaders(user, session),
    body: JSON.stringify(body),
  }), environment(database), executionContext);
}

async function open(database, user, mode, room, peerId, characterId, extra = {}, session) {
  const response = await post(database, user, { op: "open", mode, room, peerId, characterId, ...extra }, session);
  const data = await response.json();
  return { response, data, session: response.ok ? {
    peerId,
    memberToken: data.memberToken ?? session?.memberToken,
    roomSessionId: data.authority.roomSessionId,
    authorityEpoch: data.authority.authorityEpoch,
    clientSeq: data.lastClientSeq,
  } : null };
}

function player(peerId, characterId, name) {
  return { peerId, characterId, name, classId: "warden", level: 1, ready: false };
}

function envelope(session, room, kind, payload, overrides = {}) {
  const clientSeq = overrides.clientSeq ?? session.clientSeq + 1;
  return {
    protocol: "ashfall-room",
    protocolVersion: 2,
    roomCode: room,
    roomSessionId: session.roomSessionId,
    eventId: overrides.eventId ?? `event-${session.peerId}-${clientSeq}-${Date.now()}`,
    peerId: session.peerId,
    clientSeq,
    authorityEpoch: overrides.authorityEpoch ?? session.authorityEpoch,
    kind,
    sentAt: Date.now(),
    payload,
  };
}

async function event(database, user, room, session, kind, payload, overrides = {}) {
  const item = envelope(session, room, kind, payload, overrides);
  const response = await post(database, user, { op: "event", room, peerId: session.peerId, envelope: item }, session);
  const data = await response.json();
  if (response.ok) session.clientSeq = item.clientSeq;
  return { response, data, envelope: item };
}

test("authenticated protocol creates, invites, sequences, checkpoints, and resumes", async (t) => {
  const database = await createSQLiteD1();
  t.after(() => database.close());
  const room = "ABC234";

  const created = await open(database, "host@example.test", "create", room, PEERS.host, CHARACTERS.host);
  assert.equal(created.response.status, 201);
  assert.match(created.data.inviteToken, /^[A-Za-z0-9_-]{32,96}$/);
  const host = created.session;

  const wrongInvite = await open(database, "guest@example.test", "join", room, PEERS.guest, CHARACTERS.guest, { inviteToken: "x".repeat(32) });
  assert.equal(wrongInvite.response.status, 403);

  const joined = await open(database, "guest@example.test", "join", room, PEERS.guest, CHARACTERS.guest, { inviteToken: created.data.inviteToken });
  assert.equal(joined.response.status, 201);
  const guest = joined.session;

  const joinEvent = await event(database, "guest@example.test", room, guest, "join", {
    type: "join", player: player(PEERS.guest, CHARACTERS.guest, "Guest"),
  });
  assert.equal(joinEvent.response.status, 201);

  const forgedSnapshot = await event(database, "guest@example.test", room, guest, "snapshot", {
    type: "snapshot", stateVersion: 1, room: { code: room, hostPeerId: PEERS.guest, players: { [PEERS.guest]: player(PEERS.guest, CHARACTERS.guest, "Guest") } },
  });
  assert.equal(forgedSnapshot.response.status, 403);

  const snapshotRoom = {
    code: room,
    hostPeerId: PEERS.host,
    players: {
      [PEERS.host]: player(PEERS.host, CHARACTERS.host, "Host"),
      [PEERS.guest]: player(PEERS.guest, CHARACTERS.guest, "Guest"),
    },
    run: null,
    stateVersionV146: 1,
  };
  const checkpoint = await event(database, "host@example.test", room, host, "snapshot", {
    type: "snapshot", stateVersion: 1, room: snapshotRoom,
  });
  assert.equal(checkpoint.response.status, 201);

  const replay = await event(database, "host@example.test", room, host, "ready", {
    type: "ready", peerId: PEERS.host, ready: true,
  }, { clientSeq: host.clientSeq });
  assert.equal(replay.response.status, 409);

  const pollWithoutMembership = await worker.fetch(new Request(`http://localhost/api/multiplayer?room=${room}&since=0`, {
    headers: { "x-ashfall-test-user": "outsider@example.test", "x-ashfall-peer-id": PEERS.outsider },
  }), environment(database), executionContext);
  assert.equal(pollWithoutMembership.status, 401);

  const resumed = await open(database, "host@example.test", "resume", room, PEERS.host, CHARACTERS.host, {}, host);
  assert.equal(resumed.response.status, 200);
  assert.equal(resumed.data.authority.snapshotVersion, 1);
  assert.equal(resumed.data.authority.snapshot.hostPeerId, PEERS.host);
  assert.notEqual(resumed.data.memberToken, host.memberToken);

  const wrongHunter = await open(database, "host@example.test", "resume", room, PEERS.host, CHARACTERS.guest, {}, resumed.session);
  assert.equal(wrongHunter.response.status, 409);
});

test("guest activity cannot renew or erase the host lease and active field state cannot migrate", async (t) => {
  const database = await createSQLiteD1();
  t.after(() => database.close());
  const room = "DEF567";
  const created = await open(database, "host@example.test", "create", room, PEERS.host, CHARACTERS.host);
  const host = created.session;
  const joined = await open(database, "guest@example.test", "join", room, PEERS.guest, CHARACTERS.guest, { inviteToken: created.data.inviteToken });
  const guest = joined.session;
  await event(database, "guest@example.test", room, guest, "join", { type: "join", player: player(PEERS.guest, CHARACTERS.guest, "Guest") });
  const activeRoom = {
    code: room,
    hostPeerId: PEERS.host,
    players: {
      [PEERS.host]: player(PEERS.host, CHARACTERS.host, "Host"),
      [PEERS.guest]: player(PEERS.guest, CHARACTERS.guest, "Guest"),
    },
    run: { runId: "run-fixture", phase: "player" },
    stateVersionV146: 1,
  };
  assert.equal((await event(database, "host@example.test", room, host, "snapshot", { type: "snapshot", stateVersion: 1, room: activeRoom })).response.status, 201);

  database.database.prepare("UPDATE multiplayer_rooms SET lease_expires_at = 0 WHERE room_code = ?").run(room);
  const claim = await post(database, "guest@example.test", { op: "claim", room, peerId: PEERS.guest }, guest);
  assert.equal(claim.status, 409);
  assert.equal((await claim.json()).recoveryRequired, true);

  const guestLeave = await post(database, "guest@example.test", { op: "leave", room, peerId: PEERS.guest }, guest);
  assert.equal(guestLeave.status, 200);
  const stored = database.database.prepare("SELECT host_peer_id, lease_expires_at FROM multiplayer_rooms WHERE room_code = ?").get(room);
  assert.equal(stored.host_peer_id, PEERS.host);
  assert.equal(stored.lease_expires_at, 0);
});

test("explicit Emberwatch host leave transfers a membership-clean checkpoint", async (t) => {
  const database = await createSQLiteD1();
  t.after(() => database.close());
  const room = "JMK789";
  const created = await open(database, "host@example.test", "create", room, PEERS.host, CHARACTERS.host);
  const host = created.session;
  const joined = await open(database, "guest@example.test", "join", room, PEERS.guest, CHARACTERS.guest, { inviteToken: created.data.inviteToken });
  const guest = joined.session;
  await event(database, "guest@example.test", room, guest, "join", {
    type: "join", player: player(PEERS.guest, CHARACTERS.guest, "Guest"),
  });
  const campRoom = {
    code: room,
    hostPeerId: PEERS.host,
    players: {
      [PEERS.host]: player(PEERS.host, CHARACTERS.host, "Host"),
      [PEERS.guest]: player(PEERS.guest, CHARACTERS.guest, "Guest"),
    },
    run: null,
    worldV14: null,
    stateVersionV146: 1,
  };
  assert.equal((await event(database, "host@example.test", room, host, "snapshot", {
    type: "snapshot", stateVersion: 1, room: campRoom,
  })).response.status, 201);
  assert.equal((await event(database, "host@example.test", room, host, "leave", {
    type: "leave", peerId: PEERS.host,
  })).response.status, 201);

  const leaveResponse = await post(database, "host@example.test", { op: "leave", room, peerId: PEERS.host }, host);
  assert.equal(leaveResponse.status, 200);
  const leave = await leaveResponse.json();
  assert.equal(leave.closed, false);
  assert.equal(leave.authority.hostPeerId, PEERS.guest);
  assert.equal(leave.authority.authorityEpoch, 2);
  assert.equal(leave.authority.snapshotVersion, 2);
  assert.equal(leave.authority.snapshot.hostPeerId, PEERS.guest);
  assert.deepEqual(Object.keys(leave.authority.snapshot.players), [PEERS.guest]);
  const members = database.database.prepare(
    "SELECT peer_id FROM multiplayer_members WHERE room_session_id = ? ORDER BY peer_id",
  ).all(host.roomSessionId);
  assert.deepEqual(members.map((member) => member.peer_id), [PEERS.guest]);

  guest.authorityEpoch = 2;
  const nextCheckpoint = structuredClone(leave.authority.snapshot);
  nextCheckpoint.stateVersionV146 += 1;
  const checkpoint = await event(database, "guest@example.test", room, guest, "snapshot", {
    type: "snapshot", stateVersion: 3, room: nextCheckpoint,
  });
  assert.equal(checkpoint.response.status, 201);
});

test("expired Emberwatch authority transfers once and rejects the stale host epoch", async (t) => {
  const database = await createSQLiteD1();
  t.after(() => database.close());
  const room = "GHJ678";
  const created = await open(database, "host@example.test", "create", room, PEERS.host, CHARACTERS.host);
  const host = created.session;
  const joined = await open(database, "guest@example.test", "join", room, PEERS.guest, CHARACTERS.guest, { inviteToken: created.data.inviteToken });
  const guest = joined.session;
  await event(database, "guest@example.test", room, guest, "join", { type: "join", player: player(PEERS.guest, CHARACTERS.guest, "Guest") });
  const campRoom = {
    code: room,
    hostPeerId: PEERS.host,
    players: {
      [PEERS.host]: player(PEERS.host, CHARACTERS.host, "Host"),
      [PEERS.guest]: player(PEERS.guest, CHARACTERS.guest, "Guest"),
    },
    run: null,
    worldV14: null,
    stateVersionV146: 1,
  };
  assert.equal((await event(database, "host@example.test", room, host, "snapshot", { type: "snapshot", stateVersion: 1, room: campRoom })).response.status, 201);
  database.database.prepare("UPDATE multiplayer_rooms SET lease_expires_at = 0 WHERE room_code = ?").run(room);

  const claimResponse = await post(database, "guest@example.test", { op: "claim", room, peerId: PEERS.guest }, guest);
  assert.equal(claimResponse.status, 200);
  const claim = await claimResponse.json();
  assert.equal(claim.claimed, true);
  assert.equal(claim.authority.hostPeerId, PEERS.guest);
  assert.equal(claim.authority.authorityEpoch, 2);

  const stale = await event(database, "host@example.test", room, host, "ready", {
    type: "ready", peerId: PEERS.host, ready: true,
  });
  assert.equal(stale.response.status, 409);
  assert.match(stale.data.error, /authority epoch/i);

  guest.authorityEpoch = 2;
  const newHostSnapshot = structuredClone(campRoom);
  newHostSnapshot.hostPeerId = PEERS.guest;
  newHostSnapshot.stateVersionV146 = 2;
  const nextCheckpoint = await event(database, "guest@example.test", room, guest, "snapshot", {
    type: "snapshot", stateVersion: 2, room: newHostSnapshot,
  });
  assert.equal(nextCheckpoint.response.status, 201);
});
