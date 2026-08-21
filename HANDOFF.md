# Development handoff

Treat this repository as the canonical ASHFALL game client/source and private Site runtime. Do not rebuild the game from scratch. Preserve existing saves, classes, Hunter's Ascent, Huntforged crafting, Deep Hunts, Delves, bosses, camp systems, equipment slots, art, and progression unless explicitly changing them. The `site/` runtime is materialized around the root split source; `site/public/game` must never become a separately edited canonical copy.

Current v0.14 design identity: **open-world/sandbox RPG on the surface; high-risk extraction gameplay inside Delves and Deep Hunts.**

Product direction and scope decisions live in [ROADMAP.md](ROADMAP.md). The categorized implementation backlog and online migration contract live in `docs/`.

Before claiming a fix:

1. Run `npm test` to validate JavaScript syntax, static source invariants, assets, the stable save key and equipment-slot definitions, critical return/interaction wiring, and release parity.
2. Run `npm run build` whenever split source or an asset changes, then run `npm test` again. Pull requests verify the submitted bundle without rewriting it; branch pushes may regenerate and commit the artifact after source checks pass.
3. Browser-test the affected path at the supported desktop viewport sizes.

For Site work, run `npm run site:materialize -- --out <empty-directory>` and validate that output. Promote only through the Sites lifecycle and preserve the owner-only access policy unless the owner explicitly approves a wider audience. Do not add a service that can incur charges without separate approval.

The current static tests do not execute save migrations, inventory operations, or gameplay routes. Those require fixtures and runtime/browser coverage before stronger compatibility claims are made.

The split files are development source. `release/ASHFALL_Huntbound_Alpha_v0.14.0_Open_World.html` is a generated, self-contained QA/release artifact and must remain byte-for-byte reproducible from that source.
