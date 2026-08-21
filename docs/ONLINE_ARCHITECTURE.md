# ASHFALL Online Architecture

Status: **proposed direction for technical spikes; no backend vendor or framework is locked**.

Canonical gameplay baseline: **ASHFALL / Huntbound v0.14.0 — Open World**.

## Purpose

Move ASHFALL from a browser-hosted co-op prototype to reliable server-authoritative online play without replacing its current game identity:

> Explore shared or private surface regions → accept contracts, farm, hunt, and discover Delves → enter high-risk PvE extraction instances → return to Emberwatch → craft and evolve equipment → enter harder regions and Grand Hunts.

The browser remains the renderer, input client, and optional offline host. Durable online characters, multiplayer simulation, competitive records, and the economy move to authenticated server authority.

## Honest product language

- **Now:** solo and 1–4 player browser co-op hunt RPG with open-world exploration and PvE extraction Delves.
- **Invited private external playtest:** the current relay may be used after explicit owner approval and disclosure that identity, authority, results, and saves are untrusted/local; this is not an authoritative beta.
- **After authoritative private matches:** server-authoritative online co-op RPG.
- **After shared hubs/zones and durable social systems:** shared-world or MMO-lite RPG.
- **Only after proven shared persistence, operations, and concurrency:** Sandbox MMO/RPG extraction hybrid.

A four-player private room is not an MMO. “Extraction” should be qualified as PvE unless competitive extraction is actually introduced.

## Current relay reality

The current implementation is useful for private testing but is not a production multiplayer backend.

The relay handler, D1 schema, private Site shell, and hosting configuration currently live in the separate ChatGPT Site workspace rather than this canonical game-client repository. Bringing that deployment source under the same versioned, reproducible build is Stage 0 foundation work; until then, a repository clone reproduces local/same-browser play but not the hosted cross-browser relay.

### Current client authority

- Character profiles and party records are stored in browser `localStorage`.
- A random per-tab peer ID lives in `sessionStorage`.
- Same-browser rooms use `BroadcastChannel`.
- The room creator’s browser owns the canonical `room`, `worldV14`, and `run` objects.
- Guests send commands to that browser and render its snapshots.
- The host browser generates maps, validates movement, resolves combat, rolls loot, and creates settlements.
- Guests apply settlement messages to their own local profiles.

This is “host authoritative” only in the peer-to-peer sense. The host remains an untrusted game client.

### Current remote transport

The Site relay stores JSON events in a D1 `multiplayer_events` table:

- `GET` polls events after a numeric cursor.
- `POST` appends an event up to 220 KB.
- `DELETE` removes every event for a room code.
- Old events expire after two hours.
- The client polls approximately every 180 ms while healthy and every 650 ms after an error.
- Full room snapshots are frequently transmitted.
- Room codes are four base-36 characters when created by the current client.

### Security and reliability limitations

- No account authentication or durable player identity.
- No authenticated room membership or signed invitation.
- Room code is both discovery and effective access control.
- Relay accepts the sender and `peerId` contained in the payload.
- No server-side command schema or game-rule validation.
- No command sequence, acknowledgement, durable deduplication, or replay protection.
- No rate limits, presence lease, reconnect reservation, host migration, or authoritative checkpoint.
- Any client-owned profile, gear, stat, score, or settlement can be modified locally.
- Host loss ends authority for the room.
- Relay cleanup and room deletion are not owner-authorized.
- Polling and repeated full snapshots create unnecessary database and bandwidth load.
- In-memory client deduplication disappears on reload.

These limitations should be documented, not hidden. The relay can remain as a private-preview compatibility path while its replacement is built.

## Architectural principles

1. **Preserve gameplay before distributing it.** Extract deterministic rules without redesigning the loop.
2. **Clients submit intent, never outcomes.** No client may grant damage, loot, currency, score, or progression.
3. **One writer owns each live instance.** A room/zone actor serially orders commands and state changes.
4. **Persist outcomes, not every frame.** Live positions belong to the instance; characters, ownership, and settlements belong to durable storage.
5. **Exactly-once economic effects.** Retries and reconnects must not duplicate rewards or costs.
6. **Version everything.** Protocol, save, run, content, and settlement schemas require explicit versions and migrations.
7. **Offline and online can coexist.** Offline play remains useful, but offline/client-owned outcomes cannot enter verified competitive systems.
8. **Scale after measurement.** Begin with one region and a modular service; do not begin with Kubernetes or a microservice fleet.

## Target boundaries

### Browser client

- Canvas rendering, animation, audio, UI, input, accessibility, and local preferences.
- Optional interpolation/prediction for movement.
- Receives sanitized snapshots/deltas and server-authored events.
- May retain an offline save realm.
- Never contains privileged credentials or authoritative economy logic.

### Deterministic simulation package

- Content registry and schema validation.
- Seeded generation and random number service.
- Movement/collision and interaction validation.
- Combat, anatomy, status, AI, boss phases, and timers.
- Extraction, wipe, loot generation, score, and settlement calculation.
- Pure command-in/event-and-state-out API.
- Reusable by authoritative server, replay tooling, tests, and optional offline host.

### Online service

- Authentication and sessions.
- Account/character selection and cloud persistence.
- Parties, invitations, matchmaking, reservations, presence, and reconnect.
- Authoritative instance lifecycle and ordered command processing.
- Exactly-once settlement and economy ledger.
- Friends, blocks, Companies, chat, notifications, seasons, and leaderboards.
- Administration, moderation, replay lookup, metrics, and deployment control.

### Durable storage

- Account and identity links.
- Character/profile version.
- Item ownership/equipment.
- Currency/material balances plus append-only mutation ledger.
- Progression, mastery, contracts, Codex, trophies, titles, and unlocks.
- Run metadata, participants, result digest, and settlement record.
- Company membership/contributions and seasons.
- Audit, sanction, report, and migration history.

## Technical-spike candidates

### Candidate A: Nakama + PostgreSQL

Nakama is a strong spike candidate because it already provides browser-compatible authentication/session APIs, realtime sockets, parties, matchmaking, authoritative matches, storage, friends, groups, chat, presence, tournaments, and leaderboards. Its server runtime supports TypeScript, Go, and Lua.

Potential advantages:

- Avoids rebuilding common social and matchmaking primitives.
- Authoritative match handlers map naturally to party runs and zone actors.
- Groups can model Hunting Companies.
- Authoritative leaderboards can reject direct client score submission.
- Storage supports version/conditional-write behavior.
- Open-source development path with managed deployment available later.

Spike risks:

- TypeScript runtime restrictions may complicate reuse of browser-oriented code.
- Operational and framework coupling must be evaluated.
- Open-source multi-node behavior and live-match failure recovery require careful testing; some clustering capabilities are commercial.
- Custom economy constraints may still require server runtime logic beyond built-in storage.

### Candidate B: custom TypeScript WebSocket service + PostgreSQL

Potential advantages:

- Full runtime and protocol control.
- Direct reuse of a TypeScript simulation package.
- Straightforward debugging and conventional deployment.

Spike risks:

- ASHFALL must build and operate authentication integration, matchmaking, parties, presence, chat, Companies, leaderboards, moderation hooks, and administrative tooling.
- Easy to create an under-tested bespoke platform that distracts from gameplay.

### Candidate C: edge stateful actors + relational persistence

A stateful edge actor per room/zone, such as a Durable Object-style design, could provide low-operations authoritative instances and WebSocket hibernation.

Spike risks:

- ChatGPT Site bindings and production portability must be verified.
- Social, matchmaking, administrative, and leaderboard systems still need construction.
- Runtime limits and database transaction semantics must be tested against settlement and replay requirements.

### Decision rule

Do not choose from feature lists alone. Implement the same vertical spike in the leading candidates:

1. Authenticate two browsers.
2. Load cloud-owned hunters.
3. Create/join an Emberwatch party.
4. Enter Emberwood.
5. Complete one server-generated surface fight.
6. Enter and extract from Emberroot Cellar.
7. Apply one exactly-once settlement.
8. Reconnect one browser mid-run.
9. Retrieve an ordered replay and state checksum.

Select the candidate with the smallest operational surface that passes the spike without distorting the simulation. Nakama/PostgreSQL is the recommended first candidate, not a committed dependency.

## Staged migration

### Stage 0 — deterministic core

Extract the simulation and content registry. Introduce seeded RNG, schemas, migrations, command/event types, and replay tests while the current Site continues to operate.

Exit gate:

- No authoritative simulation code depends on DOM, canvas, audio, transport, or `localStorage`.
- Recorded command streams reproduce identical final state checksums.
- Current saves and the full golden loop retain parity.

### Stage 1 — identity and cloud saves

Add guest/device authentication with account linking, server-owned online characters, versioned storage, inventory ownership, ledgered mutations, backup/recovery, and legacy import.

Exit gate:

- One account loads the same hunter across browsers.
- Concurrent mutation cannot duplicate or overwrite an item.
- Clients cannot directly assign security-critical fields.
- Settlement retry grants rewards once.

### Stage 2 — authoritative private 1–4 co-op

Run Emberwatch, surface, Delve, and Deep Hunt state on an authoritative instance. Replace relay events with authenticated realtime commands, acknowledgements, ordered deltas, periodic snapshots, reconnect reservations, and instance checkpoints.

Exit gate:

- Creator/browser closure does not end the match.
- Four players complete multiple hunts through simulated loss, duplication, and reordering.
- Server rejects impossible movement, forged identity/stats, invalid targets, and duplicate action submissions.
- A two-hour soak test has no state divergence.

### Stage 3 — matchmaking and authoritative closed beta

Add durable parties, private invites, quick play, filters, ready checks, region selection, service health, abandon/reconnect policy, run IDs, operations dashboards, and staged rollouts.

Exit gate:

- At least 250 simulated CCU and 100 active instances pass load testing.
- A 24-hour soak test passes.
- Match join success is at least 99% in the test environment.
- Same-region action acknowledgement p95 is measured and below the published beta target.

### Stage 4 — shared-world instances

Introduce a shard directory, shared Emberwatch, small shared surface regions, contribution/credit rules, dynamic events, and atomic zone handoff. Delves and Deep Hunts remain private 1–4-player instances.

Exit gate:

- Full hub and surface populations remain synchronized.
- Shutdown recovery returns every character to one valid shard/location.
- Resource and encounter rewards cannot duplicate during handoff/reconnect.

### Stage 5 — six-to-eight-player Grand Hunts

Add raid-group assembly, server-timed action windows, default Guard for absent input, batched/simultaneous resolution, reconnect slots, contribution records, and raid-specific mechanics.

Exit gate:

- Eight remote players complete a Grand Hunt.
- One disconnect/reconnect does not reset or stall the fight.
- AFK hunters cannot block a round indefinitely.
- Each participant receives one settlement.

### Stage 6 — Companies, seasons, and MMO-like operations

Move Hunting Companies, friends, chat, presence, global/friend/class/solo/party ladders, weekly objectives, and seasonal rollover to durable authority. Add moderation, invalidation, leaderboard recomputation, and live-operations tooling.

Exit gate:

- A complete season opens, ranks verified runs, rolls over, and grants idempotent rewards in simulation/staging.
- Leaderboards rebuild from authoritative run results.
- Operators can quarantine a result, sanction an account, restore a character, and roll back a release.

## Command and state protocol

A representative client command envelope:

```json
{
  "protocolVersion": 1,
  "matchId": "match_...",
  "characterId": "char_...",
  "commandId": "uuid",
  "clientSequence": 42,
  "expectedStateVersion": 819,
  "type": "SUBMIT_ACTION",
  "payload": {
    "action": "ATTACK",
    "targetId": "enemy_...",
    "targetPartId": "foreleg"
  }
}
```

The authenticated socket supplies the real account and presence. The server must not trust `characterId`, party role, coordinates, stats, targets, timestamps, or rewards merely because they appear in the payload.

A representative server response contains:

- Monotonic server sequence.
- New state version.
- Acknowledged command ID.
- Ordered domain events.
- Compact state delta.
- Periodic state checksum and recoverable snapshot boundary.

Rules:

- Duplicate `commandId` returns the prior acknowledgement/result.
- Stale state can be rejected or safely rebased by command type.
- Missing sequences trigger delta replay or a full snapshot.
- Timers use server time.
- Static content travels by versioned ID, not in every snapshot.
- Full snapshots are periodic/recovery tools, not the response to every input.

## Legacy local-save policy

Preserving local saves and protecting competitive integrity are separate requirements.

1. Never silently delete or overwrite an existing local profile.
2. Provide a versioned export before import.
3. Import by copying into a server record with provenance and original content/save versions.
4. Mark imported profiles `legacy_unranked` or place them in a Founders/Legacy realm.
5. Allow normal PvE, crafting, Codex, and social use where safe.
6. Exclude unverifiable local progression from authoritative seasonal/ranked ladders.
7. Offer a new ranked-online character path owned by the server from creation.
8. Never allow an imported item to be traded into a verified economy unless it is replaced or normalized through an explicit server process.
9. Preserve offline mode as a separate realm; offline outcomes never merge automatically into online balances.

Because the current save is client-owned, no cryptographic process can retroactively prove it was never edited. Labeling is safer and more honest than pretending an import validator can establish provenance.

## Population and instance model

| Instance | Initial target | Authority | Durable data |
|---|---:|---|---|
| Personal/offline Emberwatch | 1 | Local offline host | Local realm save |
| Online Emberwatch shard | 24–40 | Server zone actor | Character location, social state, service outcomes |
| Shared surface region | 8–16 | Server zone actor | Character location, completed durable objectives, reward outcomes |
| Private surface expedition | 1–4 | Server match actor | Checkpoints and settlement |
| Delve | 1–4 | Server match actor | Checkpoints, extraction/wipe settlement |
| Deep Hunt | 1–4 | Server match actor | Route history, checkpoints, extraction/wipe settlement |
| Grand Hunt | 6–8 | Dedicated server match actor | Phase checkpoints, verified result, settlement |
| Training / Cinder’s Wager | 1 or party | Service/private actor | Validated persistent costs/rewards only |

Population targets are starting hypotheses. Increase only after measured simulation, bandwidth, UI readability, and encounter-credit behavior pass.

### Handoff invariant

A character has at most one active authoritative location lease. Joining a destination instance requires a reservation; the source releases authority only after the destination accepts. A failed handoff restores the source lease or returns the hunter to a safe Emberwatch recovery point.

## Durable data model

Conceptual entities, whether implemented through backend-native storage or explicit relational tables:

- `account` and `linked_identity`
- `character` and `character_version`
- `character_progression`
- `item_template` and `item_instance`
- `equipment_assignment`
- `currency_balance` and `economy_ledger`
- `monster_mastery`, `codex_entry`, and `contract_state`
- `party`, `party_member`, and `match_reservation`
- `run`, `run_participant`, `run_checkpoint`, and `run_result`
- `run_settlement`
- `zone_instance` and `location_lease`
- `company`, `company_member`, and `company_contribution`
- `season` and `leaderboard_record`
- `friend_edge`, `block_edge`, `report`, and `sanction`
- `content_version`, `migration`, and `audit_event`

Rapidly evolving, low-risk progression can use versioned JSON documents. Item ownership, balances, settlements, ranked results, membership roles, and sanctions require constrained server-owned records and auditability.

## Anti-cheat invariants

1. Authenticated server session determines account and presence.
2. Only the server may create an online item ID.
3. One item ID has at most one owner and at most one equipped slot.
4. Only the server changes online currency/material balances.
5. Every economy mutation has an idempotency key, reason, actor, timestamp, and resulting version.
6. Server owns RNG seed/state, map, encounters, enemy AI, combat, drops, timers, score, and settlement.
7. Clients submit intent; client-computed outcomes are ignored.
8. A character holds at most one active match/zone lease.
9. A command can affect only its authenticated participant and only when legal for the current state/phase.
10. A run may settle a character once, enforced by a unique `(run_id, character_id)` key.
11. Ranked scores originate only from authoritative completed runs using eligible characters/content versions.
12. Suspicious results can be quarantined before leaderboard publication.
13. Deterministic command/event logs can reproduce material run outcomes.
14. Client hashes, minification, and obfuscation are defense-in-depth, never authority.

## Economy invariants

- Settlement and ledger write occur atomically or through a durable outbox that is safe to retry.
- Crafting atomically verifies/removes costs and creates/upgrades the target item.
- Salvage atomically destroys ownership and grants the documented materials.
- Equipment operations cannot clone or orphan item ownership.
- Recovery Pouch and death-cache ownership use explicit state transitions.
- Merchant stock is server-seeded and purchase is conditional on unsold stock plus sufficient balance.
- Bad-luck protection changes only with an authoritative eligible roll.
- Loadouts reference owned item IDs and cannot create items.
- No player trade/auction system ships before escrow, provenance, duplicate prevention, fraud response, and rollback are implemented.

## Reconnect and failure behavior

- Match reservation outlives a transient socket disconnect for a documented grace period.
- Disconnected combatant uses safe deterministic default behavior after the action deadline.
- Client reconnect requests missing deltas by server sequence; server sends a full snapshot if history is unavailable.
- Live instances checkpoint at safe transitions and a measured interval, not on every movement input.
- A crashed unrecoverable extraction instance returns players to the last durable checkpoint and applies no uncommitted settlement.
- Players never receive both crash compensation and the original settlement without distinct auditable transactions.
- Empty instances terminate cleanly after a grace period.

## Operations and observability

Minimum online metrics:

- Auth, party, invite, matchmaking, and join success/failure.
- Concurrent users, sockets, matches, zones, and queue depth.
- Command rate, rejection reason, acknowledgement latency, and sequence gaps.
- Disconnect/reconnect rate and restoration success.
- Simulation tick duration and slow instances.
- Checkpoint and settlement latency/failure/retry.
- Economy deltas and anomaly counts.
- Client/server version mismatch.
- Crash-free sessions and game-originated browser exceptions.

Every online run should expose a support-safe run ID. Operators need tools to inspect participant/version/result metadata, retrieve a replay, restore a character from history, quarantine a score, revoke a session, and roll back a deployment.

## Deployment posture and cost risks

Start with:

- CDN/static hosting for the browser client and approximately 19 MB of cacheable canonical assets.
- One authoritative application region near the initial beta population.
- One modular online service or single open-source Nakama node.
- Managed PostgreSQL with point-in-time recovery/backups.
- Object storage for compressed replays and diagnostic artifacts.
- Staging and production environments with automated rollback.

Avoid initially:

- Kubernetes.
- Multi-region writes.
- A service mesh.
- Per-feature microservices.
- Redis/message buses without a measured need.
- Resending full maps/content and room snapshots for every command.

Very rough capacity-planning bands, excluding development and support labor:

- Private authoritative alpha: tens to low hundreds of US dollars per month.
- Closed beta with a few hundred concurrent users: hundreds to low thousands per month.
- Shared-world operation around 1,000 concurrent users: low thousands to five figures per month depending on redundancy, traffic, logging, and managed-service choices.

The largest early risks are simulation refactoring, state/economy correctness, content cadence, moderation, recovery tooling, and support—not raw combat compute. ASHFALL’s grid/round model can be efficient if the protocol sends commands and compact deltas instead of repeated whole-room snapshots.

## Architecture decision gates

Before approving an authoritative closed beta, require:

1. Deterministic simulation and replay parity.
2. Account recovery and cloud-save conflict handling.
3. Server-owned item/economy authority.
4. Host-independent 1–4 matches.
5. Reconnect and exactly-once settlement under packet loss/retry.
6. Load and 24-hour soak evidence.
7. Monitoring, replay lookup, backup restoration, and deployment rollback.
8. Legacy/ranked realm policy implemented in code and UI.
9. Block/report/moderation minimums for any enabled communication.

Only then should the current private relay be retired for online characters. Offline/local play may keep a local transport and save realm indefinitely.
