# ASHFALL / Huntbound Backlog

Canonical baseline: **v0.14.0 Open World**.

ASHFALL is currently a solo and 1–4 player browser hunt RPG: open-world surface exploration feeds high-risk PvE extraction Delves and Deep Hunts, which feed Emberwatch crafting and character progression. This backlog extends that game. It does not authorize a redesign or a return to a pre-v0.14 structure.

## Status definitions

- **Now** — required for the next stable private-preview checkpoint.
- **Next** — the next cohesive player-facing milestone after current stabilization.
- **Later** — valuable after the core loop and online foundation are proven.
- **Online-gated** — cannot be represented as complete until identity, persistence, and/or simulation are server-owned.
- **Preserve** — existing behavior or identity protected by regression coverage.
- **Freeze** — do not expand until the stated prerequisite is met.
- **Defer** — intentionally out of scope for the foreseeable milestone sequence.

Unless a row says otherwise, “passes” means the split-source build and bundled QA artifact both pass syntax/build checks and the affected route is browser-tested at 960×608, 1440×900, and 1920×1080.

## Foundation

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Bring the private Site shell, relay handler/schema, and hosting configuration under this repository's version control, then keep Site game assets and the bundled release generated from canonical split source. | A clean clone can build the game client, QA bundle, and private Site deployment; a release checklist records matching source version/content hash and a browser boot test passes. |
| Now | Add an explicit save-safety check before each release. | Fresh character, current v0.14 fixture, and one older compatible fixture load without lost equipment, mastery, contracts, Codex, or world progress. |
| Now | Add player-controlled save export and documented recovery. | A hunter can download a versioned JSON backup and restore it into a clean browser; invalid or newer schemas fail without overwriting existing data. |
| Next | Separate deterministic rules from rendering, DOM, audio, storage, and transport. | A pure simulation entry point can initialize a seeded run, accept commands, and return events/state without browser globals. |
| Next | Version game commands, run state, character saves, content definitions, and settlements. | Every serialized object carries a schema/content version; migrations are covered by fixtures and can be run repeatedly without changing the result. |
| Next | Introduce a content registry for classes, monsters, items, encounters, quests, and regions. | Content definitions can be loaded and validated independently; duplicate IDs and missing references fail CI. |
| Later | Split the monolithic game file subsystem-by-subsystem. | No individual gameplay module exceeds the agreed size threshold; circular dependencies are absent; parity tests cover the extracted behavior. |
| Online-gated | Accounts, cloud characters, and durable cross-device progression. | The same authenticated hunter loads on two browsers; concurrent updates cannot duplicate or overwrite items/currency; server audit history exists. |
| Preserve | Canonical v0.14 open-world identity, six classes, local save key compatibility, fixed logical canvas, and existing art direction. | Regression fixtures and visual smoke tests prove these remain available after each structural change. |
| Preserve | Zero-additional-cost foundation until the owner separately approves spending. | No change enables a paid service, billable overage, marketplace product, or public infrastructure by assumption; quota pressure causes backoff, degradation, or a disabled prototype path instead. |
| Freeze | New broad systems while simulation extraction is incomplete. | No new system enters production without a pure rule boundary, save migration, and at least one automated behavior test. |
| Defer | Wholesale engine/framework rewrite. | Reconsider only if measured browser, maintainability, or networking limits cannot be solved by modular extraction. |

Completed foundation checkpoint — 2026-08-21:

- Versioned the private Site shell, Worker, D1 relay schema/migration, hosting manifest, locked build, and deployment assets under `site/`.
- Added a dependency-free, guarded materializer and byte-parity coverage for the split game and all 57 assets.
- Reduced idle relay polling, removed client room deletion, stopped per-request schema DDL, limited cleanup frequency, and moved new rooms to six-character codes.
- Recorded the observed subsystem and persistence/runtime schemas in `docs/SYSTEM_INVENTORY.md` and `docs/PERSISTENCE_SCHEMAS.md`.
- Added current, all-class, legacy, corrupt, unknown-field, quota-failure, stale-preview, and recovery save coverage; the canonical localStorage key remains unchanged.
- Added player-controlled local JSON export, validated preview, add-only/conflict-copy import, automatic recovery snapshots, and corrupt-byte quarantine without a paid service.
- Added executable production-route coverage for North Gate entry, exact animal combat without teleporting, single-claim resources, surface wipe to bonfire, and Emberroot Cellar selection.
- Preserved the owner-only Site policy and zero-additional-cost constraint.

## World

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Finish the Emberwatch ↔ North Gate ↔ Emberwood route as the golden path. | Twenty consecutive round trips place every living hunter on walkable intended spawn tiles; Hunt Board and North Gate interaction zones never overlap. |
| Now | Validate death, Return to Camp, Delve exit, and Deep Hunt extraction destinations. | Every tested exit resolves to the Emberwatch bonfire or its explicitly documented destination; no route exposes a stale surface or dungeon state. |
| Now | Complete collision and click-target audits for NPCs, animals, resources, gates, caches, and entrances. | Exact-tile and keyboard interactions produce the same valid action; no non-portal object causes an unintended map transition. |
| Now | Continue the Emberwatch and Emberwood readability pass. | Main routes, region boundaries, points of interest, traversal blockers, resource silhouettes, and Delve entrances are identifiable without opening the minimap. |
| Next | Turn Emberwood into the definitive first-region sandbox. | The region supports at least three contract types, three resource loops, normal packs, two elite variants, one dynamic event, one Delve, and a clear escalation route. |
| Later | Add a second surface-region vertical slice only after Emberwood metrics are healthy. | The new region has a distinct traversal/resource/enemy identity and completes the same surface → extraction → forge loop without duplicating Emberwood content. |
| Later | Add systemic weather, time, migrations, rare events, and faction/reputation consequences. | Systems alter encounters or decisions rather than only tinting visuals; each has deterministic test seeds and readable player signaling. |
| Online-gated | Shared surface zones and public world events. | Eight to sixteen remote players remain synchronized; contribution credit is fair; shard restart and zone handoff cannot duplicate rewards. |
| Preserve | Persistent Emberwatch, Emberwood Lowlands, North Gate, surface farming, elites, resources, contracts, and discoverable Delves. | All remain reachable and functional in fresh and migrated saves. |
| Freeze | Additional regions until the first-region hour is polished and measured. | Proceed only after new players can complete the golden loop without developer guidance and without a progression blocker. |
| Defer | One seamless continent, housing, territorial control, and unrestricted world persistence. | Revisit only after shared-zone infrastructure, moderation, and a proven returning population exist. |

## Combat

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Stabilize same-map surface combat. | Clicking or engaging an adjacent animal begins combat on the visible surface terrain; position and facing survive victory; wipe returns to Emberwatch. |
| Now | Finish downed, dead, revive, and spectator presentation for all six classes. | Every class has distinct readable standing, downed, and fallen states; revive prompts and remaining-down counts agree across host and guest. |
| Now | Audit targeting, range, line of sight, anatomy selection, telegraphs, and action submission. | Invalid commands are rejected with a reason; exact Ranger targeting and melee engagement remain correct; no party member can submit twice in one round. |
| Now | Establish a balance sheet for solo and 2/3/4-player scaling. | Each current boss has documented HP, damage, defense, action frequency, and median clear-time targets for all supported party sizes. |
| Next | Make Direfang the combat-quality benchmark. | Dedicated arena, colossal footprint, anatomy effects, three readable phases, avoidable signature mechanics, loot sequence, and solo/party scaling all pass scripted tests. |
| Next | Give each enemy family a recognizable tactical role. | Every family has at least one behavior that changes positioning, targeting, timing, or resource decisions; Codex text accurately explains it after discovery. |
| Next | Add server-ready action deadlines and deterministic default behavior. | A configurable deadline resolves missing actions to Guard without state divergence; replays produce identical outcomes. |
| Later | Expand boss-specific arenas, phase transitions, hazards, adds, enrage logic, and counterplay. | Each major boss has at least two mechanics not shared by ordinary enemies and at least one anatomy break that changes behavior. |
| Online-gated | Truly authoritative remote combat and validated Grand Hunt resolution. | Server owns RNG, enemy AI, damage, loot, timers, and state; clients cannot forge stats, actions, targets, or settlements. |
| Preserve | Six classes, specializations, talents, Hunter’s Ascent, skill mastery, distinct animations, breakable anatomy, boss footprints, and exact click targeting. | Automated class-action and anatomy fixtures pass after every combat refactor. |
| Freeze | Seventh class and large skill-tree expansion. | Resume only after all six classes meet readability, role, solo viability, and party-contribution targets. |
| Defer | Competitive PvP and open-world player killing. | Revisit only after authoritative infrastructure, separate balance rules, moderation, and a clear product case exist. |

## Extraction

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Regression-test every success, field extraction, safe extraction, disconnect, wipe, and death-cache route. | A route matrix passes solo and 2-player host/guest tests; each result grants exactly the documented retained/lost value. |
| Now | Make carried value, secured item, Hunt Heat, spoor, and extraction risk readable at decision points. | Test players can state what is at risk and what will be retained before voting without consulting external instructions. |
| Next | Strengthen route choice and rare-event identity. | Every branch presents a distinct risk, reward, and boon; at least six deterministic seeded routes and all rare event types are covered by tests. |
| Next | Improve Fallen Expedition Cache and Nemesis continuity. | Cache ownership/location survives save/reload; a second wipe cannot silently replace an unrecovered cache; Nemesis rank/reward changes are visible. |
| Later | Add new Delve families with authored objectives and extraction topology. | Each new family contains a unique objective, environmental pressure, resource identity, boss, and safe/unsafe extraction decision. |
| Online-gated | Durable mid-run checkpointing, reconnect, and exactly-once settlement. | Server failure or browser closure restores the run from its last checkpoint; `(run_id, character_id)` can settle only once. |
| Preserve | Delves, Deep Hunts, branching routes, rare expedition events, Recovery Pouch, Hunt Heat, spoor tracking, extraction votes, wipe economy, death caches, and Nemeses. | Existing fixtures retain their expected reward/loss outcomes. |
| Freeze | Harsher loss rules. | Do not increase wipe penalties until telemetry shows players understand risk and return after losses. |
| Defer | PvPvE extraction. | Reconsider only after cooperative extraction retention, authoritative networking, and anti-collusion systems are mature. |

## Gear / Economy

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Audit all ten equipment slots, comparison logic, equip/unequip, salvage, lock, favorite, loadout, and crafting paths. | Scripted inventory tests cannot duplicate, orphan, overwrite, or equip an item into an incompatible slot. |
| Now | Improve drop, recipe, set-bonus, and Huntforged identity readability. | Every item states slot, rarity, item level, useful stat delta, trait/set effect, source, and identity stage without opening multiple panels. |
| Now | Verify Huntforged evolution from Huntforged through Tempered, Masterworked, and Awakened. | Each step checks its requirements, removes the exact cost once, preserves item identity/ID, and produces the documented stat change. |
| Next | Build a progression/economy model for Levels 1–30 and Ascension. | Target acquisition times, gold/material sources and sinks, upgrade cadence, and expected gear rating by region are documented and simulation-tested. |
| Next | Make targeted boss crafting the primary deterministic progression path. | Every major boss supports meaningful recipes across the ten-slot system; bad RNG cannot block required region progression. |
| Later | Add more item traits, build-changing Mythics, cosmetic trophies, and horizontal sidegrades. | New power has a countervailing build choice; no single item becomes mandatory across all classes/content. |
| Online-gated | Server-owned item instances, balances, crafting, drops, and economy ledger. | Every item has one owner and unique server ID; every balance mutation has an idempotency key and auditable cause. |
| Preserve | Ten slots, monster Huntsets, Relics, Mythics, bad-luck protection, loadouts, build codes, Huntsmith, Relic Crafter, enhancement/reforging, and evolving equipment identity. | Existing owned items migrate without changed IDs or silent stat loss. |
| Freeze | Global item-stat rebalance and inventory wipe. | Any reset requires explicit design approval, migration plan, player communication, and before/after simulation data. |
| Defer | Player trading, auction house, and freely transferable premium items. | Revisit only after server authority, escrow, anti-dupe controls, fraud response, and economy telemetry are proven. |

## Solo / Co-op

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Maintain complete solo parity. | Every current surface contract, service, Delve, Deep Hunt, boss, crafting path, and return route can be completed solo at an intended difficulty. |
| Now | Finish a repeatable cross-browser 2–4-player regression matrix on the current relay. | Join, movement, preparation, world interaction, combat, vote, settlement, return, and leave paths pass with no console exception or divergent UI. |
| Now | Make relay limitations visible without overstating reliability. | Connection status distinguishes same-tab fallback and remote relay; failure messages explain whether a room can continue or must be recreated. |
| Next | Add party quality-of-life that survives the server transition. | Invite copy, party member readiness, class/gear summary, target pings, vote state, and reconnect placeholder have consistent UX. |
| Later | Add opt-in companion behavior for solo testing only if required by encounter design. | Companions never replace the viability of a true solo build and are disabled from ranked score comparison unless explicitly categorized. |
| Online-gated | Hostless authoritative 1–4 co-op, matchmaking, presence, reconnect, and durable lobbies. | Host closure does not end a run; authenticated players reconnect; commands are ordered/deduplicated; match join success and latency meet published beta SLOs. |
| Online-gated | Six-to-eight-player Grand Hunts. | Eight players can complete the encounter with timed action windows, AFK defaults, reconnect slots, and exactly-once rewards. |
| Preserve | Solo-first usability, optional co-op, host-browser-authoritative behavior during the untrusted prototype, party records, MVP awards, and party-size boss scaling. | Solo and each supported party size remain in the release test matrix. |
| Freeze | More than four players in the browser-hosted simulation. | Unlock only after the authoritative server owns match state and a six-to-eight-player encounter passes a load/reconnect spike. |
| Defer | Voice chat. | Use external voice during testing; reconsider only with a moderation, privacy, and operating-cost plan. |

## UI / Art / Audio

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Eliminate normal webpage scrolling and preserve the fixed logical canvas. | Desktop browsers at the three release viewports show the complete playable area and critical HUD without body scrollbars or clipped controls. |
| Now | Continue reducing HUD bulk with floating HP/resource, contextual actions, and drawers. | Combat-critical values remain continuously visible; optional panels can be hidden; the game remains playable with all drawers closed. |
| Now | Normalize input hitboxes and visible interaction affordances. | Canvas clicks map correctly under every tested letterbox/scale; hover/click/keyboard prompts agree on the same target and range. |
| Now | Polish map art without changing canonical sprite identity. | Terrain seams, path joins, prop collisions, object layering, silhouettes, and lighting pass a documented visual review for Emberwatch and Emberwood. |
| Now | Complete distinct down/death sprite presentation for each class. | All six classes are identifiable while standing, downed, and fallen at native and scaled canvas sizes. |
| Next | Add remappable keyboard controls, controller support, reduced motion, scalable UI text, and color-safe telegraphs. | Full golden loop is completable by keyboard-only and controller; critical mechanics remain readable under reduced-motion and common color-vision simulations. |
| Next | Establish a consistent UI component/token system inside the existing art direction. | Buttons, panels, badges, rarity, warnings, focus states, spacing, and type hierarchy use documented tokens with no one-off regressions. |
| Later | Add region music, boss themes, positional combat cues, ambient layers, and a complete sound mixer. | Master/music/effects controls persist; required mechanics have a visual alternative; no sound overlaps exceed the agreed channel budget. |
| Online-gated | Friends, matchmaking, Company, chat, presence, and shard UI. | Social state comes from authenticated server data and includes block/report/moderation controls before public release. |
| Preserve | Existing sprites, pixel-art direction, class silhouettes, fixed 960×608 logical canvas, desktop priority, and dark-fantasy presentation. | Visual comparison captures show no wholesale restyle or marketing-site conversion. |
| Freeze | Full visual redesign and replacement art pipeline. | New work must improve the current visual language unless an approved art-direction brief explicitly supersedes it. |
| Defer | Mobile-first controls/layout. | Maintain a readable fallback, but prioritize desktop until the complete desktop loop and controller path are stable. |

## Content / Narrative / Onboarding

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Document the intended first-hour journey and every prerequisite it assumes. | A single golden-path specification covers hunter creation, Emberwatch orientation, North Gate, first gathering and combat, Emberroot Cellar discovery, return/defeat, contract turn-in, and first Huntforged step. |
| Now | Audit labels, prompts, Codex entries, contract copy, and service explanations against actual mechanics. | No critical first-hour instruction names a missing control, wrong destination, obsolete system, or reward that the game does not grant. |
| Now | Establish content IDs and ownership for existing NPCs, quests, contracts, encounters, regions, bosses, anatomy, recipes, and Codex entries. | An inventory lists canonical IDs, source locations, dependencies, and save impact; duplicates and dangling references are recorded as blockers for the content registry. |
| Next | Author the Living Lowlands quest arc around Direfang. | Named NPCs and staged objectives connect the wolf attacks, region exploration, Emberroot Cellar, anatomy discovery, extraction, and first named Huntforged item without a menu-only shortcut. |
| Next | Add optional, replay-safe onboarding and contextual teaching. | A new player completes the golden loop without developer guidance; an experienced player can skip repeated instruction without losing rewards or state. |
| Later | Establish a sustainable region-content pipeline and narrative cadence. | A new region can add quests, dialogue, events, contracts, encounters, loot sources, Codex entries, and localization keys through validated data rather than one-off engine edits. |
| Online-gated | Server-scheduled narrative events and shared-world consequences. | Event eligibility, state, contribution, rewards, expiry, and recovery are authoritative and versioned; late join and shard restart cannot grant duplicate outcomes. |
| Preserve | Existing dark-fantasy tone, Emberwatch/Emberwood lore, Hunt Board framing, boss identities, Codex/mastery, and player-driven exploration. | Revisions clarify and connect established material instead of replacing the setting or forcing a linear campaign. |
| Freeze | Large lore expansion and parallel region questlines. | Resume after the first-hour journey has measured completion/comprehension and the content registry is operating. |
| Defer | Fully voiced cinematic campaign and procedural text generation in live player-facing content. | Revisit only with an approved production, localization, safety, and operating-cost plan. |

## Platform / Performance / Browser Compatibility

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Define the supported desktop browser/resolution matrix and measurable budgets. | Current stable Chrome, Edge, Firefox, and Safari targets are recorded with 960×608, 1440×900, and 1920×1080 viewport cases; frame time, boot time, memory, payload, and relay-traffic budgets have owners. |
| Now | Add repeatable browser boot, console, scrolling, canvas-scale, input, and localStorage smoke checks. | Each supported browser completes a clean boot and reload with zero uncaught game errors, no normal body scrolling, correct pointer-to-tile mapping, and a successful persistence write. |
| Now | Measure the current client and relay rather than guessing capacity. | A versioned report records asset transfer size/cache behavior, parse/start time, typical snapshot size/rate, D1 request rate, and two/four-player bandwidth under a complete hunt. |
| Next | Replace repeated full multiplayer snapshots with versioned commands, compact deltas, recovery snapshots, and static content IDs. | Network bytes per active player fall below the agreed budget without divergence under loss, duplication, reordering, or reconnect tests. |
| Next | Add performance regression gates for rendering and simulation extraction. | Representative Emberwatch, Emberwood, ordinary combat, and boss scenes remain within agreed p95 frame/tick budgets on the reference desktop hardware. |
| Later | Add installable/offline caching only if it improves the browser-first promise. | Cache versioning never serves mismatched code/content; recovery and update UX are tested; local saves remain exportable. |
| Online-gated | Regional latency routing, capacity controls, and version-compatible rolling deployment. | Instances reject incompatible clients clearly; overload degrades through queues/caps rather than state loss; rollback preserves valid characters and settlements. |
| Preserve | Browser-first entry, fixed logical canvas, desktop priority, local solo capability, and cacheable canonical assets. | Platform work does not require a native client or framework rewrite to access the complete core loop. |
| Freeze | Mobile-first optimization and multi-region write architecture. | Unlock only after desktop quality, authoritative single-region operation, and measured demand justify the cost. |
| Defer | Native desktop/mobile clients and console certification. | Reconsider only after the browser product and content cadence have proven retention and the platform case is funded. |

## QA / Telemetry

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Build a golden-path browser smoke suite. | Automated or scripted coverage includes create/select hunter, create room, North Gate, animal combat, resource collection, Delve entry, extraction, wipe, bonfire return, crafting, save, and reload. |
| Now | Maintain a route/teleport matrix. | Every portal, gate, summary action, death route, and extraction route has expected origin, destination, spawn, and state cleanup recorded and passing. |
| Now | Add multiplayer protocol regression fixtures. | Join, duplicate event, out-of-order snapshot, disconnect, guest settlement, and room teardown cases have repeatable expected results. |
| Now | Treat console errors, invalid spawns, and save exceptions as release blockers. | A release run finishes with zero game-originated uncaught exceptions, zero trapped spawns, and zero failed persistence writes. |
| Next | Add deterministic simulation, fuzz, balance, and replay tests. | At least 500 seeded runs per supported party size finish without invalid state; recorded commands reproduce final checksums. |
| Next | Add privacy-conscious gameplay telemetry for the beta. | Opt-in/notice is documented; events cover funnel, deaths, extraction, disconnects, latency, and progression without collecting chat or unnecessary personal data. |
| Later | Add content dashboards and automated economy anomaly detection. | Designers can query completion, wipe, build, item-source/sink, and retention metrics by version; suspicious deltas are flagged before ladder publication. |
| Online-gated | Server observability, tracing, replay retrieval, service SLOs, alerting, and administrative rollback. | Operators can identify a failed run from its run ID, inspect ordered commands/events, restore a character, and roll back a deployment. |
| Preserve | Bundled self-contained HTML as a QA/release artifact and split files as development source. | Bundle generation remains reproducible from repository source and never becomes the primary edited artifact. |
| Freeze | Claims that a multiplayer or progression feature “works” without affected-path browser testing. | Each claim links to a completed test record or automated result. |
| Defer | Public beta access. | Do not open access until the authoritative closed-beta gates pass and public moderation, operations, abuse-control, support, and recovery requirements are met. |

## Social / MMO

| Status | Work | Acceptance criteria |
|---|---|---|
| Now | Use accurate product language. | Store copy and release notes say solo/1–4 co-op PvE extraction RPG; they do not claim MMO, global, secure, or persistent-online features that are not server-backed. |
| Now | Clearly label War Table ladders and Hunting Companies as local prototypes. | UI states that records aggregate only hunters in the current browser; no local score is presented as global or verified. |
| Next | Refine titles, Hunt Score, ghost pace, MVPs, streaks, daily hunts, build sharing, and party records as server-ready concepts. | Each has a stable ID/schema, deterministic calculation, and explicit ranked/unranked eligibility rule. |
| Later | Add shared events, Company contracts, social hub activities, regional rotations, and cosmetic prestige. | Features create cooperative interaction without mandatory daily attendance or large permanent power gaps. |
| Online-gated | Authentication, friends, blocks, presence, chat, matchmaking, global/friend/class/solo/party ladders, Companies, and seasonal rollover. | All state is authenticated and durable; authoritative results are the sole ladder input; moderation and recomputation tools exist. |
| Online-gated | Shared Emberwatch and surface shards. | Players outside one party can see and interact with one another; population caps, handoff, restart recovery, credit rules, and latency targets pass. |
| Preserve | War Table, local ladder, titles, Hunting Company prototype, daily hunt, party records, Grand Hunt concept, Codex/mastery, and Ascension. | Local/offline versions remain available until their online replacements reach feature parity. |
| Freeze | “MMO” branding. | Unlock only when authenticated persistent characters, shared zones beyond one party, durable social systems, live operations, and proven external concurrency all exist. |
| Defer | Open economy, territorial warfare, mandatory login streaks, and pay-to-win power. | These require separate approved product, economy, moderation, and ethics decisions. |

## Playtest and release gates

These labels are not interchangeable:

- **Owner-only private checkpoint** — the current unpublished/private Site used for development approval. No access change is implied by repository work.
- **Invited private external playtest** — may use the current untrusted relay only after explicit owner approval, clear disclosure that characters/results are local and unverifiable, disposable test rooms, tested export/recovery, a passed two-to-four-player route matrix, error monitoring, and no ranked economy or public availability claims.
- **Authoritative closed beta** — requires authenticated, server-owned characters and matches, host-independent continuity, exactly-once settlement, recovery tooling, and measured service targets.
- **Public beta** — additionally requires moderation, scalable operations, abuse controls, public-facing support/recovery, and an explicit publication decision.

The next private checkpoint is ready only when all **Now** items affected by its changes pass. The first authoritative closed co-op beta additionally requires:

1. Account and cloud-save recovery.
2. Server-authoritative 1–4 matches.
3. Exactly-once settlement and an economy audit trail.
4. Reconnect and host-independent continuity.
5. A 24-hour soak test plus measured latency/join SLOs.
6. Crash/error monitoring and run replay IDs.
7. Basic block/report/moderation controls for any enabled social communication.
8. A documented legacy-save and ranked-eligibility policy.
