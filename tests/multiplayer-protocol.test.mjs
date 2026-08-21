import assert from "node:assert/strict";
import test from "node:test";

import {
  createGameRuntimeHarness,
  createMemoryStorage,
} from "./helpers/game-runtime-harness.mjs";

let manualTransportSequence = 0;

function transportEvent(senderPeerId, message) {
  return {
    ...message,
    _transportId: `${senderPeerId}:manual:${++manualTransportSequence}`,
    _senderPeerId: senderPeerId,
  };
}

function deliverOutbox(source, target, predicate = () => true) {
  const events = source.drainOutbox();
  for (const event of events) {
    if (predicate(event)) target.receiveEvent(event);
  }
  return events;
}

async function createTwoPlayerParty(suffix) {
  const hostStorage = createMemoryStorage();
  const guestStorage = createMemoryStorage();
  const hostPeerId = `host-${suffix}`;
  const guestPeerId = `guest-${suffix}`;
  const host = await createGameRuntimeHarness({
    localStorage: hostStorage,
    peerId: hostPeerId,
    seed: 0x145001,
  });
  const guest = await createGameRuntimeHarness({
    localStorage: guestStorage,
    peerId: guestPeerId,
    seed: 0x145002,
  });

  host.createSoloHunter("Host Warden", "warden");
  guest.createGuestHunter("Guest Ranger", "ranger");
  const hostProfileId = host.readState().profile.id;
  const guestProfileId = guest.readState().profile.id;

  host.receiveEvent(
    transportEvent(guestPeerId, {
      type: "join",
      player: guest.joinPayload(),
    }),
  );
  const joinEvents = deliverOutbox(host, guest);
  assert.ok(joinEvents.some((event) => event.type === "snapshot"));
  assert.deepEqual(guest.readState().room, host.readState().room);

  return {
    host,
    guest,
    hostStorage,
    guestStorage,
    hostPeerId,
    guestPeerId,
    hostProfileId,
    guestProfileId,
  };
}

function readyAndLaunch(party) {
  const { host, guest, hostPeerId, guestPeerId } = party;

  guest.toggleReady();
  const guestReadyEvents = deliverOutbox(guest, host);
  assert.equal(guestReadyEvents.length, 1);
  assert.equal(guestReadyEvents[0].type, "ready");
  deliverOutbox(host, guest);

  host.toggleReady();
  deliverOutbox(host, guest);

  const readyHost = host.readState();
  const readyGuest = guest.readState();
  assert.equal(readyHost.room.players[hostPeerId].ready, true);
  assert.equal(readyHost.room.players[guestPeerId].ready, true);
  assert.deepEqual(readyGuest.room, readyHost.room);

  host.launchExpedition();
  const launchEvents = deliverOutbox(host, guest);
  assert.ok(launchEvents.some((event) => event.type === "snapshot"));

  const launchedHost = host.readState();
  const launchedGuest = guest.readState();
  assert.ok(launchedHost.room.run?.runId);
  assert.equal(launchedHost.room.run.phase, "player");
  assert.deepEqual(launchedGuest.room, launchedHost.room);
}

function openExtractionAndCollectCompletionEvents(party, lootByPeer) {
  const { host, guest, hostPeerId, guestPeerId } = party;
  host.patchRunLoot(hostPeerId, lootByPeer[hostPeerId]);
  host.patchRunLoot(guestPeerId, lootByPeer[guestPeerId]);
  host.openExtractionWindow({ safe: true });
  deliverOutbox(host, guest);

  guest.vote("extract");
  const guestVoteEvents = deliverOutbox(guest, host);
  assert.equal(guestVoteEvents.length, 1);
  assert.equal(guestVoteEvents[0].type, "vote");
  deliverOutbox(host, guest);

  host.vote("extract");
  const completionEvents = host.drainOutbox();
  const directSettlement = completionEvents.find(
    (event) => event.type === "settlement" && event.peerId === guestPeerId,
  );
  const finalSnapshot = completionEvents.find(
    (event) => event.type === "snapshot" && event.room?.run === null,
  );
  assert.ok(directSettlement, "host must emit the guest's direct settlement");
  assert.ok(finalSnapshot, "host must emit a final snapshot after settlement");
  return { completionEvents, directSettlement, finalSnapshot };
}

test("an active host leave terminally clears the guest's stale field session", async () => {
  const party = await createTwoPlayerParty("host-leave");
  const { guest, guestProfileId, hostPeerId } = party;
  readyAndLaunch(party);
  assert.ok(guest.readState().room?.run, "guest must begin in the active field");

  guest.receiveEvent(transportEvent(hostPeerId, {
    type: "leave",
    peerId: hostPeerId,
  }));

  const closed = guest.readState();
  assert.equal(closed.room, null);
  assert.equal(closed.snapshot, null);
  assert.equal(closed.roomCode, null);
  assert.equal(closed.isHost, false);
  assert.equal(closed.profile.id, guestProfileId, "room cleanup must preserve the local hunter");
});

test("host and guest ready, launch, extract, and settle exactly once across replay and reload", async () => {
  const party = await createTwoPlayerParty("settle");
  const {
    host,
    guest,
    guestStorage,
    hostPeerId,
    guestPeerId,
    guestProfileId,
  } = party;
  readyAndLaunch(party);

  const { completionEvents, directSettlement } = openExtractionAndCollectCompletionEvents(party, {
    [hostPeerId]: { gold: 120, common: 12, rare: 2 },
    [guestPeerId]: { gold: 90, common: 9, rare: 1 },
  });

  for (const event of completionEvents) guest.receiveEvent(event);

  const hostSettled = host.readState();
  const guestSettled = guest.readState();
  assert.equal(hostSettled.room.run, null);
  assert.equal(guestSettled.room.run, null);
  assert.equal(hostSettled.profile.gold, 170);
  assert.equal(hostSettled.profile.materials.common, 12);
  assert.equal(hostSettled.profile.materials.rare, 2);
  assert.equal(guestSettled.profile.gold, 140);
  assert.equal(guestSettled.profile.materials.common, 9);
  assert.equal(guestSettled.profile.materials.rare, 1);
  assert.equal(hostSettled.profile.lifetime.runs, 1);
  assert.equal(hostSettled.profile.lifetime.success, 1);
  assert.equal(guestSettled.profile.lifetime.runs, 1);
  assert.equal(guestSettled.profile.lifetime.success, 1);
  assert.equal(hostSettled.profile.settlementReceiptsV145.length, 1);
  assert.equal(guestSettled.profile.settlementReceiptsV145.length, 1);
  assert.equal(
    guestSettled.profile.settlementReceiptsV145[0],
    directSettlement.settlement.settlementId,
  );
  assert.deepEqual(guestSettled.room, hostSettled.room);

  const guestProfileAfterSettlement = guestSettled.profile;
  guest.receiveEvent(directSettlement);
  guest.receiveEvent({
    ...directSettlement,
    _transportId: `${directSettlement._transportId}:redelivery`,
  });
  assert.deepEqual(
    guest.readState().profile,
    guestProfileAfterSettlement,
    "transport and settlement receipts must reject repeat delivery in the active runtime",
  );

  const reloadedGuest = await createGameRuntimeHarness({
    localStorage: guestStorage,
    peerId: guestPeerId,
    seed: 0x145003,
  });
  reloadedGuest.loadStoredHunter(guestProfileId, { role: "guest" });
  const persistedBeforeReplay = reloadedGuest.readState().profile;
  reloadedGuest.receiveEvent({
    ...directSettlement,
    _transportId: `${directSettlement._transportId}:fresh-runtime`,
  });
  assert.deepEqual(
    reloadedGuest.readState().profile,
    persistedBeforeReplay,
    "the persisted receipt must reject a settlement replay after reload",
  );
});

test("a guest recovers a dropped direct settlement from the host's final snapshot", async () => {
  const party = await createTwoPlayerParty("snapshot-recovery");
  const { host, guest, hostPeerId, guestPeerId } = party;
  readyAndLaunch(party);

  const { directSettlement, finalSnapshot } = openExtractionAndCollectCompletionEvents(party, {
    [hostPeerId]: { gold: 70, common: 7, rare: 2 },
    [guestPeerId]: { gold: 45, common: 5, rare: 1 },
  });

  // The direct settlement is intentionally dropped. The authoritative final
  // snapshot carries completedSettlementsV145 and must recover the same result.
  guest.receiveEvent(finalSnapshot);
  const recovered = guest.readState();
  assert.equal(recovered.room.run, null);
  assert.equal(recovered.profile.gold, 95);
  assert.equal(recovered.profile.materials.common, 5);
  assert.equal(recovered.profile.materials.rare, 1);
  assert.equal(recovered.profile.lifetime.runs, 1);
  assert.equal(recovered.profile.lifetime.success, 1);
  assert.deepEqual(recovered.lastSummary, directSettlement.settlement);
  assert.deepEqual(recovered.profile.settlementReceiptsV145, [
    directSettlement.settlement.settlementId,
  ]);

  const recoveredProfile = recovered.profile;
  guest.receiveEvent({
    ...directSettlement,
    _transportId: `${directSettlement._transportId}:late`,
  });
  assert.deepEqual(
    guest.readState().profile,
    recoveredProfile,
    "a late direct settlement must not duplicate snapshot-recovered rewards",
  );
  assert.equal(host.readState().profile.lifetime.runs, 1);
});

test("a delayed older snapshot cannot regress a guest after a newer host version", async () => {
  const party = await createTwoPlayerParty("snapshot-order");
  const { host, guest, hostPeerId } = party;

  host.toggleReady();
  const olderSnapshot = host
    .drainOutbox()
    .find((event) => event.type === "snapshot");
  host.toggleReady();
  const newerSnapshot = host
    .drainOutbox()
    .find((event) => event.type === "snapshot");

  assert.ok(olderSnapshot);
  assert.ok(newerSnapshot);
  assert.ok(newerSnapshot.stateVersion > olderSnapshot.stateVersion);
  assert.equal(olderSnapshot.room.players[hostPeerId].ready, true);
  assert.equal(newerSnapshot.room.players[hostPeerId].ready, false);

  guest.receiveEvent(newerSnapshot);
  const acceptedNewerState = guest.readState();
  assert.equal(acceptedNewerState.room.stateVersionV146, newerSnapshot.stateVersion);
  assert.equal(acceptedNewerState.room.players[hostPeerId].ready, false);

  guest.receiveEvent(olderSnapshot);
  assert.deepEqual(
    guest.readState(),
    acceptedNewerState,
    "an out-of-order older snapshot must be ignored without mutating guest state",
  );
  assert.deepEqual(guest.readState().room, host.readState().room);
});

test("an extraction vote resolves when the remaining unvoted guest leaves", async () => {
  const party = await createTwoPlayerParty("choice-departure");
  const { host, guest, hostPeerId, guestPeerId } = party;
  readyAndLaunch(party);

  host.patchRunLoot(hostPeerId, { gold: 70, common: 7, rare: 2 });
  host.patchRunLoot(guestPeerId, { gold: 40, common: 4, rare: 1 });
  host.openExtractionWindow({ safe: true });
  deliverOutbox(host, guest);

  host.vote("extract");
  deliverOutbox(host, guest);
  const waiting = host.readState();
  assert.equal(waiting.room.run.phase, "choice");
  assert.equal(waiting.room.run.votes[hostPeerId], "extract");
  assert.equal(waiting.room.run.votes[guestPeerId], undefined);

  guest.leaveRoom();
  const leaveEvents = guest.drainOutbox();
  assert.equal(leaveEvents.length, 1);
  assert.equal(leaveEvents[0].type, "leave");
  assert.equal(leaveEvents[0].peerId, guestPeerId);
  for (const event of leaveEvents) host.receiveEvent(event);

  const settled = host.readState();
  assert.equal(settled.room.run, null);
  assert.equal(settled.room.players[guestPeerId], undefined);
  assert.equal(settled.lastSummary.success, true);
  assert.equal(settled.lastSummary.outcome, "extract");
  assert.equal(settled.profile.gold, 120);
  assert.equal(settled.profile.lifetime.runs, 1);
  assert.equal(settled.profile.lifetime.success, 1);

  const completionEvents = host.drainOutbox();
  assert.ok(
    completionEvents.some(
      (event) => event.type === "settlement" && event.peerId === guestPeerId,
    ),
    "the departed guest's settlement remains available for relay/recovery",
  );
  assert.ok(
    completionEvents.some(
      (event) => event.type === "snapshot" && event.room?.run === null,
    ),
    "departure re-evaluation must broadcast the completed run instead of deadlocking",
  );
});
