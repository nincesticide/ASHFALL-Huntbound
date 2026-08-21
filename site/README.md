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

## Current relay limitations

The D1 `multiplayer_events` table is a temporary event mailbox for the private prototype. The browser host still owns simulation, random rolls, loot, and settlement. The relay has no authenticated room membership, authoritative game validation, durable identity, rate limiting, or production anti-cheat guarantees.

Do not describe this relay as secure, persistent, server-authoritative multiplayer. The staged replacement is documented in `../docs/ONLINE_ARCHITECTURE.md`.

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
