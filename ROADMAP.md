# ASHFALL / Huntbound — Product Roadmap

> **Canonical state:** ASHFALL / Huntbound v0.14.0 — Open World is the current design and source baseline. This roadmap extends that build; it does not authorize a redesign, a rebuild, or a return to v0.13.x.

Execution is tracked in [docs/BACKLOG.md](docs/BACKLOG.md). The proposed server-authoritative migration, including its decision gates and legacy-save policy, is documented in [docs/ONLINE_ARCHITECTURE.md](docs/ONLINE_ARCHITECTURE.md).

This document records the approved direction for turning ASHFALL into a premier browser-first sandbox RPG and dungeon-extraction game for solo players and online parties. It is the decision framework for future implementation: new work should strengthen the connected experience described here rather than add isolated systems.

## Product identity

**ASHFALL is a browser-first, dark-fantasy tactical hunting RPG where one to four players explore a persistent frontier, track and dismantle colossal monsters, risk their carried haul inside Delves and Deep Hunts, and forge equipment that remembers how it was earned.**

The intended player-facing category during development is **1–4 player online co-op sandbox/extraction RPG**. ASHFALL should claim the MMO label only after it has server-owned characters, shared regions, Companies, chat, matchmaking, carefully bounded markets, seasons, and public events.

Testing language is deliberately tiered: an **invited private playtest** may use the current clearly disclosed, untrusted relay after explicit owner approval; an **authoritative closed beta** requires server-owned identity, simulation, settlement, and recovery; a **public beta** additionally requires moderation, operations, and public-release gates. None of these terms authorizes public Site publication without owner approval.

### Product promise

- Start instantly in a desktop browser with no client installation.
- Offer the same complete progression path in solo and cooperative play.
- Make the surface a persistent place worth exploring, not a menu between hunts.
- Make tactical positioning, enemy intent, and monster anatomy the signature combat language.
- Make every descent a clear decision about risk, reward, and extraction.
- Let Huntforged equipment acquire identity and history instead of becoming disposable stat loot.
- Grow into a shared online world without sacrificing focused 1–4 player expeditions.

## Design pillars

### 1. A living frontier

The surface must feel inhabited and reactive. Creatures roam, hunt, retreat, migrate, and contest resources. Landmarks, shortcuts, events, weather, campsites, and persistent consequences make exploration valuable even without a contract marker.

### 2. The hunt is tactical

Combat remains simultaneous and turn-based. Enemy intent, movement, range, line of sight, terrain, party roles, and anatomy breaks must create legible decisions every round. ASHFALL should not become a generic real-time action game.

### 3. Risk is chosen and understood

The player knowingly crosses from safer surface exploration into Delves and then Deep Hunts. The interface must always distinguish what is banked, carried, secured, and at risk. Greater danger earns materially better opportunities.

### 4. Gear remembers

Huntforged equipment is the progression spine. Targeted creatures and deliberately broken anatomy provide named materials that shape an item's evolution through Tempered, Masterworked, and Awakened identities.

### 5. Solo complete, co-op elevated

All critical content must be playable solo. Cooperative play should add coordination, class interactions, rescue decisions, and social stories rather than merely inflate enemy health.

### 6. Browser-native accessibility

The game must remain fast to enter, readable at a desktop viewport, free of normal page scrolling, compatible with the fixed logical canvas, and resilient across reconnects. Complexity belongs in the game world, not in setup friction.

## Core loop

1. **Prepare in Emberwatch** — choose a Hunt Board objective, adjust equipment, craft, study the Codex, and form a party.
2. **Explore the surface** — travel through persistent regions, gather resources, meet NPCs, complete quests, discover tracks, and encounter roaming creatures or elites.
3. **Choose the risk** — bank supplies, continue the surface hunt, enter a discovered Delve, or descend into a Deep Hunt.
4. **Track and dismantle** — read intent, position the party, target meaningful anatomy, and adapt to terrain and monster behavior.
5. **Secure or extract** — decide when to press deeper and when to carry unsecured rewards home.
6. **Return to Emberwatch** — heal, recover, turn in contracts, update mastery, and convert the hunt into lasting progress.
7. **Forge an identity** — craft or evolve named gear that changes future builds and opens harder regions.

The first complete vertical-slice journey is:

> Arrive at Emberwatch → investigate wolf attacks → explore and gather → discover tracks → choose whether to bank supplies or enter Emberroot Cellar → locate Direfang → break specific anatomy → survive or extract → return to the bonfire → forge the first named Huntforged item → unlock the next frontier.

## Progression responsibilities

Each progression system must have one clear job:

| System | Responsibility |
| --- | --- |
| Class | Defines the hunter's fundamental combat verbs and party role. |
| Specialization | Changes how those verbs behave; it should not be only percentage bonuses. |
| Hunter's Ascent | Supplies long-term character and build choices without replacing class identity. |
| Ten equipment slots | Define the active build and its tradeoffs. |
| Huntforged identity | Records targeted hunts and creates long-term equipment evolution. |
| Codex/mastery | Converts knowledge of creatures, anatomy, and regions into hunting advantages. |
| Expedition boons | Provide temporary run-specific adaptation and end with the expedition. |

The Huntforged path remains:

**Huntforged → Tempered branch choice → Masterworked identity → Awakened rule-changing effect**

Random field equipment supports, modifies, or feeds this path. Relics and Mythics remain rare chase items with novel effects, not routine replacements with larger numbers.

## Risk model

| Layer | Intended risk | Intended consequence and reward |
| --- | --- | --- |
| Surface | Low | Carried resources can be lost; equipped gear remains safe; discovery and gathering are reliable. |
| Delve | Medium | Finite carrying capacity, physical extraction, recovery-cache opportunity, stronger targeted rewards. |
| Deep Hunt | High | Escalating Hunt Heat, increasingly valuable unsecured rewards, difficult extraction decisions. |
| Grand Hunt | Organized prestige risk | Coordinated encounters and prestigious rewards; no arbitrary permanent equipment deletion. |

Equipped gear should not permanently disappear on death because that contradicts equipment identity. Defeat can instead cause injury, durability damage, scars, lost carried supplies, or a recoverable unsecured cache.

## Combat contract

Every combat round should read clearly as:

**Enemy intent → hunter planning → simultaneous hunter resolution → enemy resolution → terrain and status resolution**

Required combat qualities:

- Exact movement, attack-range, and line-of-sight previews.
- Expected damage and anatomy-break previews where information is known.
- Clearly marked boss danger tiles and interruptible mechanics.
- Responsive locking, cancellation, animation, sound, hit-stop, and death-cause feedback.
- Party combinations such as mark → break, taunt → counter, burn → detonate, and stagger → execute.
- Optional turn timers with a safe automatic Guard fallback.
- Anatomy whose destruction changes behavior and rewards deliberate targeting.

Examples of meaningful anatomy:

- Broken fangs disable or weaken bite attacks.
- A broken foreleg weakens movement and pounces.
- Broken wings prevent flight or repositioning.
- Broken armor exposes a lasting weak point.
- A deliberate break guarantees its named crafting material.
- Boss presentation visibly reflects broken or severed parts.

## Versioned delivery plan

### v0.14.x — Foundations and regression safety

**Outcome:** Stabilize the canonical Open World build and create safe seams for continued development without changing its identity or invalidating saves.

Scope:

- Preserve Emberwatch, Emberwood Lowlands, the North Gate, Hunt Board, Delves, Deep Hunts, classes, animations, bosses, Codex, crafting, equipment, Hunter's Ascent, multiplayer, and local saves.
- Characterize the current simulation with automated golden-path tests.
- Cover Emberwatch ↔ Emberwood travel, Delve entry and exit, extraction, defeat, bonfire return, save/load, and multiplayer authority.
- Introduce versioned schemas and migrations for characters, worlds, items, runs, and settlement results.
- Replace authoritative unseeded randomness with a seeded source suitable for deterministic replay.
- Split the gameplay monolith subsystem-by-subsystem into simulation, content, rendering, UI, persistence, and networking boundaries.
- Keep the self-contained bundled HTML as a generated QA/release artifact.

Implemented in the current v0.14.x checkpoint:

- Repaired the supported Hunt Board path so generated Deep Hunt plans enter their active branching/extraction flow.
- Added ID-bearing, retryable local settlements with bounded receipt ledgers, exactly-once application inside the retained receipt window, and rollback when the canonical profile write fails.
- Made generic and Huntforged crafting atomic with respect to the local profile write.
- Added deterministic solo coverage from Delve/Deep Hunt launch through extraction or clear, Emberwatch return, crafting, persistence, and fresh reload.
- Added deterministic multiplayer protocol coverage for host/guest join, readiness, launch, extraction, direct/final-snapshot settlement recovery, replay/reload rejection, stale snapshots, and extraction reevaluation after departure.
- Added an authenticated, membership-bound room protocol with server-derived senders, exact sequences, replay rejection, rotating resume tokens, ordered event cursors, presence/authority leases, durable checkpoints, and camp-only authority succession.
- Active surface, Delve, and Deep Hunt authority remains on the same browser across reconnect; the protocol deliberately denies active-field host migration instead of pretending another browser can safely reconstruct hidden state.
- Added persisted run seeds and RNG state, stable participant/entity/settlement identities, a bounded versioned command ledger, and replay coverage that is isolated from presentation-only entropy.
- The same-browser `BroadcastChannel` path is now an explicit offline/local fallback instead of a parallel authority channel.

This checkpoint remains a free local/host-browser prototype. Site identity now authenticates room membership and the relay durably orders/checkpoints transport, but characters, simulation, loot, and progression remain browser-owned. Production server-owned identity/progression/simulation, hostile-host protection, and active-instance migration remain online-gated; transport authority must not be described as game authority.

Exit criteria:

- Existing v0.14 save fixtures load without loss of classes, gear, mastery, progression, or ten-slot equipment state.
- Automated tests cover every critical transition and both victory and defeat settlement paths.
- At least one complete hunt can be replayed deterministically from a seed and recorded inputs.
- Solo, host, and guest clients resolve the same authoritative settlement outcome in multiplayer tests.
- The split source and generated release bundle boot without console-blocking errors.
- The desktop game fits the viewport without normal webpage scrolling at supported test resolutions.
- No known blocker or high-severity regression remains in the vertical-slice route.

### v0.15 — The Living Lowlands

**Outcome:** Turn Emberwatch, Emberwood Lowlands, Emberroot Cellar, and Direfang into one exceptional, complete solo/co-op vertical slice.

Scope:

- Expand Emberwood into four or five connected sectors: North Gate and Hunter Road, Briarwood, Emberback grazing territory, Burnscar ruins/resource ridge, and Direfang territory.
- Replace stationary encounter buttons with roaming creatures that use sight, hearing, pursuit, retreat, and leash behaviors.
- Add predator/prey interactions and migrating elite packs.
- Create distinct regional resource chains instead of generic material pickups.
- Add shortcuts, campsites, hidden clearings, named landmarks, weather or danger conditions, and persistent regional changes.
- Add named NPCs, one authored regional quest arc, and repeatable Hunt Board contracts.
- Make Emberroot Cellar a physically discovered optional Delve.
- Make Direfang the region's culminating hunt and the source of the first named Huntforged item.

Exit criteria:

- At least 10 memorable points of interest are discoverable in Emberwood.
- At least 6 surface encounter families and 2 named elites inhabit the region.
- At least 3 regional resource chains feed specific crafting goals.
- At least 2 dynamic regional events can occur and resolve.
- One complete authored quest chain connects Emberwatch, the surface, Emberroot Cellar, Direfang, and forging.
- A new player can forge the first meaningful Huntforged item in approximately 45–75 minutes without repetitive grinding.
- Direfang is discoverable and defeatable through exploration and mastery rather than a menu-only launch.
- The complete route passes in solo and two-player co-op with no blocker, transition, death, or extraction defects.

### v0.16 — Huntbound Combat

**Outcome:** Make simultaneous tactical hunting, class cooperation, monster intent, and anatomy ASHFALL's unmistakable signature.

Scope:

- Implement the full combat-round presentation contract.
- Add exact planning previews, danger telegraphs, better action locking, and stronger combat feedback.
- Give every class a complete, distinct solo-capable tactical role.
- Make specializations alter ability behavior.
- Add intentional cross-class setup and payoff combinations.
- Deepen anatomy consequences, guaranteed break materials, and visible monster damage states.
- Expand boss phases around positioning and anatomy rather than health inflation.
- Complete downed, rescue, death, and reconnect behavior for every class.

Exit criteria:

- Every enemy action exposes readable intent before resolution unless explicitly designed as a rare hidden mechanic.
- All six existing classes complete the vertical slice solo and contribute at least two distinct co-op interactions.
- Every specialization changes at least one core ability rule or tactical pattern.
- Direfang and the vertical-slice boss roster each have at least three behavior-changing anatomy targets.
- Breaking anatomy produces its promised combat consequence and deterministic named-material reward.
- Players can identify movement, target, expected consequence, and unresolved risk before locking an action.
- Downed, rescued, dead, disconnected, and reconnected hunters settle correctly in solo and multiplayer tests.

### v0.17 — Risk and Identity

**Outcome:** Make extraction decisions and evolving equipment the durable progression spine.

Scope:

- Present banked, carried, secured, and at-risk inventory states everywhere they matter.
- Give Delves physical entry, escalating objectives, finite capacity, and physical extraction.
- Give Deep Hunts escalating Hunt Heat and a compelling press-on-or-leave cadence.
- Add recovery caches, injuries, durability, and scars as legible defeat consequences.
- Complete meaningful Tempered branches, Masterworked identities, and Awakened rule changes.
- Connect contracts, targeted anatomy, regional resources, crafting, mastery, and equipment evolution.
- Balance random loot as useful support rather than the replacement for named Huntforged gear.

Exit criteria:

- Before every descent or extraction decision, the UI states exactly what will be retained and lost.
- Delve and Deep Hunt rewards rise measurably with risk and cannot be optimized by repeatedly farming only the safest room.
- No defeat path arbitrarily deletes equipped identity gear.
- At least one item family supports two meaningful Tempered branches, a Masterworked identity, and an Awakened effect that changes play.
- Every required identity material has a discoverable, targetable source recorded in the Codex.
- Telemetry can measure entry, depth, extraction, defeat, recovery, and item-evolution decisions.

### v0.18 — ASHFALL Online

**Outcome:** Replace prototype transport and browser-owned progression with secure, authoritative online play while preserving solo access and existing hunters.

Scope:

- Extract and run the deterministic simulation as an authoritative service.
- Add accounts, cloud characters, reconnect, join-in-progress, friends, parties, and matchmaking.
- Import existing local hunters into an unranked **Founders Realm** while retaining the original local save as a recovery copy.
- Make the server authoritative for maps, combat, random rolls, loot, settlement, and progression.
- Add operational monitoring, moderation foundations, version compatibility, and recovery tooling.
- Keep local/offline-compatible solo development builds where technically viable, clearly separated from ranked online authority.

Exit criteria:

- A player can create an account, import or create a hunter, form a party, complete a hunt, reconnect, extract, and see authoritative progress on another device.
- Clients cannot authoritatively grant themselves loot, settlement, or progression through modified local state.
- A disconnected hunter can reconnect to an active expedition within the supported recovery window.
- Matchmaking supports solo, private-code, friends-only, and public 1–4 player parties.
- Cloud-save conflicts and failed settlements have tested, observable recovery paths.
- A full authoritative hunt meets the agreed latency, uptime, and operating-cost budget under target alpha concurrency.

### v0.19+ — Shared Frontier

**Outcome:** Earn the MMO identity through persistent social spaces and shared world activity without compromising tactical expedition play.

Scope:

- Emberwatch social shards for approximately 24–40 players.
- Shared surface-region instances for approximately 8–16 players, plus a private 1–4 player option.
- Instanced Delves and Deep Hunts for 1–4 players.
- Grand Hunts for organized groups of approximately 6–8 players.
- Companies, chat, social discovery, authoritative leaderboards, seasons, public events, and carefully bounded markets.
- Region expansion only after the Living Lowlands quality bar is repeatable.

Exit criteria:

- Players can meet, communicate, form parties, and launch content from a persistent Emberwatch shard.
- Shared surface events resolve authoritatively for eligible participants without disrupting private expeditions.
- Companies and seasonal goals create cooperative objectives without becoming mandatory for core progression.
- A 6–8 player Grand Hunt preserves readable intent, tactical planning, anatomy, and acceptable round pacing.
- Economy sinks, sources, fraud controls, and rollback procedures exist before unrestricted player trading.
- Live operations can deploy, observe, recover, and roll back a season or public event safely.

## Multiplayer topology target

| Activity | Target population |
| --- | --- |
| Emberwatch social shard | Approximately 24–40 players |
| Shared surface region | Approximately 8–16 players |
| Private surface region | 1–4 players |
| Delve / Deep Hunt | 1–4 players |
| Grand Hunt | Approximately 6–8 players |

This topology provides MMO persistence and community while protecting the clarity and pacing of simultaneous tactical combat.

## Scope categories

### Preserve continuously

These are canonical and must survive refactors and future milestones:

- Emberwatch as the persistent hub and bonfire return point.
- Emberwood Lowlands and the North Gate transition.
- Surface exploration, monsters, elites, resources, quests, contracts, and discovered entrances.
- Delves and Deep Hunts as optional extraction layers.
- The Hunt Board.
- Huntforged crafting and equipment identity/evolution.
- The ten-slot equipment system.
- Hunter's Ascent.
- Existing classes, specializations, animations, and class identity.
- Boss mechanics and meaningful anatomy.
- Codex and mastery.
- Camp services and Cinder's Wager.
- Local-save compatibility and importability.
- Existing sprites, visual direction, fixed logical canvas, and desktop-first presentation.
- Solo completeness and 1–4 player cooperative play.

### Freeze during v0.14.x–v0.15

Keep these working, but do not add substantial content until the vertical slice and foundation meet their exit criteria:

- Local seasonal ladder.
- Hunting Companies.
- Cinder's Wager expansion.
- Additional Relic/Mythic combinations.
- Ascension expansion.
- Additional classes.
- Additional surface regions beyond the Living Lowlands slice.

### Defer until online authority and the vertical slice are proven

- Competitive PvP.
- Auction house and unrestricted player trading.
- A shared player economy.
- Housing and agricultural farming.
- Mobile-first redesign.
- A seamless massive overworld.
- Competitive ranked seasons.
- Multiple new surface regions developed in parallel.

### Explicit non-goals

- Rebuilding ASHFALL from scratch.
- Reverting to a v0.13.x menu-driven design.
- Replacing the playable RPG with a marketing site.
- Converting tactical combat into generic real-time combat.
- Inflating content count while the core route remains shallow or unreliable.
- Using permanent equipped-item deletion as the primary source of extraction tension.
- Claiming MMO scale before the necessary authoritative and social systems exist.

## Delivery rules

- **Depth before breadth:** deepen explore, track, position, break, extract, and forge before introducing new nouns.
- **One complete route first:** Emberwatch → Living Lowlands → Emberroot Cellar → Direfang → extraction → Huntforged evolution is the quality bar for later regions.
- **Keep builds playable:** land refactors in behavior-preserving increments and retain the bundled release artifact.
- **Protect saves:** every persisted schema change includes migration, fixtures, and rollback considerations.
- **Prove multiplayer authority:** a feature is not multiplayer-complete until host, guest, reconnect, settlement, and failure paths are tested.
- **Use measurable gates:** a milestone advances because its exit criteria pass, not because its feature list has been started.
- **Preserve art direction:** extend the current sprite language and dark-fantasy presentation rather than replacing it wholesale.
- **Remain free until separately approved:** use only existing included/free resources during the foundation; throttle, degrade, or pause an online feature before enabling a service or quota overage that can create a charge.

## Immediate execution order

1. Freeze the canonical v0.14 source/release relationship and critical compatibility wiring with dependency-free invariants. **Completed for this foundation checkpoint; runtime fixtures follow.**
2. Inventory the v0.14 gameplay monolith by subsystem and document current persistence schemas, including the now-versioned private Site relay/deployment boundary. **Completed for this foundation checkpoint; extraction follows.**
3. Build save fixtures and golden-path runtime coverage for the critical vertical-slice transitions. **First checkpoint completed: current/legacy/recovery saves plus North Gate, exact surface interaction, resource, wipe/bonfire, and Emberroot Cellar routes; extraction settlement, crafting, reload, and host/guest cases remain.**
4. Introduce seeded authoritative randomness and deterministic replay for one complete hunt.
5. Extract simulation, content, rendering, UI, persistence, and networking behind stable interfaces.
6. Begin v0.15 with Emberwood sectors, roaming creature behavior, and the authored Direfang journey.

The governing principle is simple:

> **Stop adding nouns. Deepen the verbs: explore, track, position, break, extract, and forge.**
