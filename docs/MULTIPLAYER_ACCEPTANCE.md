# ASHFALL v0.14 Multiplayer Browser Acceptance

This is an incremental acceptance record for the current Open World vertical slice. It does not imply that ASHFALL, its content, or its multiplayer architecture is feature-complete.

## Pass 1 — 2026-08-21

Private owner-only Site source, authenticated room protocol v2.

| Check | Result | Evidence |
|---|---|---|
| Site shell boots | Pass | ASHFALL title and game frame rendered. |
| Canonical game boots inside the Site | Pass | v0.14 HUD, Emberwatch scene, and saved hunters rendered. |
| Select an existing hunter | Pass | `QA Hunter` entered the Expedition Camp flow. |
| Enter Emberwatch as host | Pass | Emberwatch HUD and camp services rendered. |
| Create an authenticated room | Blocked | The local browser-preview D1 contained the legacy event table but not the new room/member tables. |
| Guest join and synchronized camp movement | Not run | Blocked by room creation. |
| North Gate and Emberwood synchronization | Not run | Blocked by room creation. |
| Exact animal combat and shared result | Not run | Blocked by room creation. |
| Delve entry, combat, and settlement | Not run | Blocked by room creation. |
| Host and guest reload/resume | Not run | Blocked by room creation. |
| Emberwatch leadership transfer | Not run | Blocked by room creation. |
| Active-field host-loss safety | Not run | Blocked by room creation. |

## Corrective action

- The agent-preview development command now applies all checked-in D1 migrations before Vite starts.
- Wrangler and the Cloudflare Vite plugin explicitly share the same project-local preview state.
- The stale legacy preview database was moved to a recoverable backup; browser `localStorage` character saves were not touched.
- Site typecheck and production build pass.
- Five Site tests pass, including the migration/bootstrap configuration invariant and the migration-backed room protocol suite.
- Four canonical Site-materialization tests pass, including preservation of the preview configuration.

## Next pass

Repeat the browser flow from a clean preview database and do not mark Step 1 complete until two clients pass:

1. Create room and join with a second hunter.
2. Move both hunters in Emberwatch and cross the North Gate.
3. Fight an exact-tile surface animal without teleporting either client.
4. Enter Emberroot Cellar, complete or extract, and apply each character-bound settlement once.
5. Reload guest and host separately and verify token-rotating same-hunter resume.
6. Transfer leadership at Emberwatch camp.
7. Verify active-field host loss freezes or closes safely instead of migrating hidden state.

Automated protocol tests support this pass but do not replace it.

## Pass 2 — 2026-08-21

Clean agent preview after applying the checked-in D1 migrations.

| Check | Result | Evidence |
|---|---|---|
| Create authenticated room | Pass | `QA Hunter` created room `7GBTQS`; the badge reported authenticated transport online. |
| Join from a second client | Pass | `QA Ally` joined the same room and both clients rendered a 2/4 party. |
| Synchronized Emberwatch movement | Pass | The guest moved several tiles and the host view rendered the new position. |
| North Gate transition | Pass | The host walked to the cleaned North Gate, interacted at the exact gate prompt, and both clients entered Emberwood Lowlands. |
| Exact animal click starts combat in place | Pass | Clicking the Road Wolf Pack's exact world tile changed both clients to `Emberwood Frontier • Road Wolf Pack • Depth 1/1`; the host's initial attack was locked without teleporting the party. |
| Shared combat and surface settlement | Pass | Both clients advanced the same rounds, cleared both wolves, received their own extraction summaries, and applied distinct XP/gold/material rewards once. |
| Return to camp | Pass | `Return to Emberwatch Bonfire` cleared the world/run state and staged both hunters beside the bonfire with `Emberwatch • HUB` and `EMBERWATCH — SAFE`. |
| Guest reload/resume | Pass | Reloading, then selecting the same `QA Ally` profile, restored room `7GBTQS` and reported `Reconnected to your party`. |
| Host reload/resume | Pass | Reloading, then selecting the same `QA Hunter` profile, restored leader authority and the same two-player room. |
| Emberwatch leadership transfer | Pass after fix | The first pass exposed a stale departed-host checkpoint. The server now removes the departing host, advances the checkpoint, and transfers authority atomically. Retest showed a 1/4 party containing only `QA Ally` and `You are party leader`, with no membership rejection. |
| Emberroot Cellar completion/settlement | Not run | Surface settlement was verified; the longer three-floor Delve browser pass remains. |
| Active-field host-loss safety | Not run in browser | Migration denial is covered by the authenticated protocol suite; browser confirmation remains. |
| Wipe/death bonfire return | Not run in browser | Successful return-to-bonfire was verified; forced wipe remains. |

## Pass 2 corrective action

- Explicit camp host leave now rewrites the stored checkpoint to the surviving membership, advances its snapshot version, and then transfers the authority epoch.
- The successor applies that clean checkpoint before publishing its first authoritative snapshot.
- The membership validator remains strict; no security check was weakened.
- A migration-backed regression test reproduces the browser ordering (`leave` event, membership removal, authority transfer) and proves the successor's next checkpoint is accepted.
- Site typecheck, production build, and all six Site tests pass.

## Remaining browser acceptance

Completed in Pass 3 below.

## Pass 3 — 2026-08-21

Two real browser clients against the private agent preview, followed by focused lifecycle corrections and a clean retest.

| Check | Result | Evidence |
|---|---|---|
| Physical Emberroot Cellar entry and party launch | Pass | Both clients used the discovered surface entrance, readied independently, and entered the same three-floor Delve. |
| Shared rounds and revive | Pass | Host and guest movement/actions advanced one authoritative round at a time; `QA Hunter` revived the downed `QA Ally` and both clients received the restored state. |
| Natural multiplayer wipe | Pass | The unmodified low-level party wiped on floor two. Both clients received the same `PARTY WIPED` settlement, then `Return to Emberwatch Bonfire` placed both in `EMBERWATCH — SAFE`. |
| Three-floor Cellar completion | Pass with isolated QA fixture | A fortified local QA character fixture separated protocol verification from unfinished balance. The clients naturally traversed and resolved synchronized rounds across all three floors, defeated Rootmaw Alpha, and both received `EXTRACTION SUCCESS`. The fixture was runtime-only and is not shipped. |
| Character-bound settlement | Pass | The final room checkpoint held two different settlement IDs keyed to the two character IDs, with distinct loot/gold/material payloads. |
| Exactly-once reward persistence | Pass | After both summaries were closed, `QA Hunter` was `Lv 3 • 116/367 XP` and `QA Ally` was `Lv 3 • 88/367 XP`. Reloading and reselecting both saved hunters preserved those exact values and did not replay either summary. |
| Closed/invalid active room cleanup | Pass after fix | Before the fix, deleting test room `FW38LD` left both clients interactive-looking in the stale hunt with `Room membership required`. After the fix, deleting active test room `4XW2GQ` returned both clients to `No room` and the saved-character screen within one poll. |
| Unexpected active host loss | Pass after fix | Closing the host for test room `L32VK5` left the original host peer and authority epoch unchanged after lease expiry. The guest displayed the persistent reconnect-required hint and Attack/Guard were disabled; it did not claim hidden authority. |
| Host-leave checkpoint race | Pass in protocol regression | An `activeField: true` leave now fail-closes even when the persisted checkpoint still looks like Emberwatch, preventing the debounced-snapshot race from transferring unsafe authority. |

## Pass 3 corrective action

- Fatal `401/404` room polls now clear the stale room, stop transport, show the title/character screen, and retain local hunter saves.
- Active-field recovery is now an explicit server authority flag even when the client already has the newest snapshot.
- Guests cannot submit combat, movement, cancellation, or extraction commands while the active field is frozen.
- Active host leave flushes queued/pending snapshots before departure and sends a fail-closed active-field hint to the server.
- Departure can no longer resurrect a cleared session token through an asynchronous post.
- Protocol regressions cover known-version recovery signaling, guest command rejection, explicit active-host closure, and the stale-checkpoint leave race.

The multiplayer vertical-slice gate is complete. This does not certify content volume, progression balance, production-scale concurrency, or MMO persistence; those remain later roadmap phases.
