# ASHFALL private Site runtime

This directory versions the private ChatGPT Site shell, Cloudflare-compatible worker, D1 relay schema, migrations, locked dependencies, and presentation assets used by ASHFALL v0.14.0.

The playable game is not duplicated here. The canonical development source remains at the repository root:

- `index.html`
- `css/game.css`
- `js/game.js`
- `assets/`

The canonical repository's `scripts/materialize-site.mjs` copies this runtime and those game files into a complete deployable directory. Generated `site/public/game/` content is ignored in GitHub and tracked only in the separate Sites deployment mirror, so it cannot silently become a second editable game source.

## Free-only operating boundary

- Uses the existing private ChatGPT Site and its existing logical D1 binding.
- Uses no R2 bucket, paid database, hosted game server, authentication vendor, marketplace integration, or third-party API.
- Adds no public access and does not publish or widen the Site audience.
- Uses only open-source npm dependencies locked by `package-lock.json`.

This documents the current deployment; it does not promise that a hosting provider will never change its own quotas or pricing. Any change that could create a charge requires separate owner approval.

## Current room-service boundary

The Worker now authenticates room operations with the private Site user context and stores rooms, character-bound memberships, hashed invite/member capabilities, exact client sequences, ordered events, presence/authority leases, and recovery checkpoints in D1. Resume rotates the membership token and replays only events after the checkpoint boundary. Host authority may transfer at Emberwatch camp; the service rejects active-field migration.

This is transport authority, not game authority. The browser host still simulates movement and combat, controls random rolls, creates loot/settlements, and writes local character saves. Server-side validation covers protocol shape, membership, sequencing, identities, and host-only messages—not ASHFALL's full game rules. A malicious host can still forge gameplay outcomes, and all-browser-state loss still ends an active run. Do not describe this prototype as server-authoritative multiplayer, a verified economy, or production anti-cheat.

`BroadcastChannel` is retained only as an explicit local fallback when the online endpoint is unavailable. It is not run alongside an authenticated room.

## Reproduce the Site source

From the root of the canonical `nincesticide/ASHFALL-Huntbound` repository, materialize into a new empty directory:

```sh
node scripts/materialize-site.mjs --out /tmp/ashfall-site
```

Then, from that generated directory, use the locked Site build:

```sh
npm run install:ci
npm test
```

The materializer refuses broad or nonempty destinations by default. `--force` is accepted only when the destination already contains this Site project's matching hosting manifest. Deployment must continue through the Sites lifecycle so its private access policy and managed D1 binding remain intact.
