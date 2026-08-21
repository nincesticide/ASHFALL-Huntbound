# ASHFALL Mob Sprite Production Plan

Branch: `art/mob-sprites-v1`

This branch is intentionally art-only. It must not modify authentication, multiplayer relay, session security, persistence, combat authority, or deployment code being developed elsewhere.

## Existing art preserved

The game already ships boss animation assets and they are out of scope for replacement:

- Direfang Alpha: dedicated 96×96-frame sheet
- Gutter King
- Mire Mother
- Sir Veyr, Ashbound
- Frostmaw, the Pale Drake
- Nameless Choir
- World Eater

The six class animation sets are also preserved. New mob art should match their 3/4 top-down pixel-art language, strong silhouettes, restrained dark-fantasy palette, nearest-neighbor rendering, and transparent backgrounds.

## Current production roster

The current game defines 31 non-boss enemy kinds. All 31 receive sprite coverage so code never silently falls back to programmer art.

### Emberwood Frontier

1. `wolf` — Road Wolf — quadruped
2. `emberboar` — Emberback Boar — quadruped brute
3. `thornling` — Briar Thornling — plant humanoid
4. `spider` — Gloam Spider — arachnid

### Ashfall Hollow

5. `gutterling` — Gutter Bombardier — goblin ranged
6. `bonearcher` — Bone Archer — undead ranged
7. `gravehusk` — Grave Husk — undead brute
8. `skeleton` — Restless Dead — undead melee

### Gloamfen

9. `fenstalker` — Fen Stalker — swamp quadruped
10. `sporeling` — Sporeling — small fungal creature
11. `bogwitch` — Bog Witch — swamp caster
12. `slime` — Bog Slime — ooze

### Ruined Keep

13. `ashguard` — Ashbound Guard — armored humanoid
14. `cinderhound` — Cinder Hound — quadruped
15. `banneret` — Ashbound Banneret — armored support humanoid
16. `knight` — Hollow Knight — armored humanoid

### Frostvein Caverns

17. `icecrawler` — Ice Crawler — low crawler
18. `frostseer` — Frostseer — frost caster
19. `crystalbeast` — Crystal Beast — crystalline quadruped
20. `drake` — Pale Drake — winged beast

### Rift Crucible

21. `voidling` — Voidling — small aberration
22. `chorister` — Rift Chorister — rift caster
23. `riftreaver` — Rift Reaver — armored aberration
24. `wraith` — Bell Wraith — spectral

### World Eater Grand Hunt

25. `mawspawn` — Maw Spawn — aberrant spawn
26. `riftmauler` — Rift Mauler — aberrant brute
27. `abyssseer` — Abyss Seer — aberrant caster
28. `worldeater` — World Eater Spawn — siege-organism spawn

### Crossover / legacy kinds still present in runtime

29. `goblin` — Ash Goblin — goblin melee
30. `cultist` — Cinder Cultist — humanoid caster
31. `golem` — Runestone Golem — stone brute

## Named lieutenant skins

These reuse a parent rig and frame timing but receive a distinct silhouette, equipment pass, palette, and one unique special animation:

- Cinderback Matriarch — parent `emberboar`
- Keeper of the Ossuary — parent `gravehusk`
- The Fen Hexer — parent `bogwitch`
- Captain of the Last Banner — parent `banneret`
- Shardhide Ancient — parent `crystalbeast`
- Bell-Reaver Exarch — parent `riftreaver`
- Herald of the Maw — parent `riftmauler`

## Universal elite layers

Do not create a full replacement sheet for every elite. Use composited overlays/accessories so any mob can visibly express its gameplay trait:

- Frenzied — ember veins, hot eyes, red attack trail
- Armored — added plate/bone/crystal pieces, blue-gray impact sparks
- Vampiric — crimson mist, blood stream on healing
- Golden Quarry — gold rim light and sparkle trail
- Nemesis Rank I–IV — scars, trophies, banners, broken weapons, escalating aura

## Sprite technical standard

All sprite files are transparent PNG with no anti-aliasing. Code renders with `imageSmoothingEnabled = false`.

### Standard/tiny mobs

- Frame canvas: 64×64
- Logical footprint: 1×1 tile
- Anchor: bottom center at approximately `(32, 56)`
- Directions: south, west, east, north

### Large/brute/winged mobs

- Frame canvas: 96×96
- Logical footprint: normally 1×1, visual overflow allowed
- Anchor: bottom center at approximately `(48, 84)`

### Core animations

- Idle: 4 frames × 4 directions
- Move: 6 frames × 4 directions
- Basic attack: 6 frames × 4 directions
- Hit: 2 frames × 4 directions
- Death: 6 frames, one readable facing minimum
- Special: 6–8 frames when the enemy has a distinct gameplay ability

Use separate sheets per animation, mirroring the existing class-asset pattern:

```text
assets/monsters/wolf/
  wolf_idle.png
  wolf_move.png
  wolf_attack.png
  wolf_hit.png
  wolf_death.png
  wolf_special.png
  wolf.sprite.json
```

## Shared production rigs

The 31 visible species should be developed from approximately 13 reusable motion foundations:

1. Small humanoid
2. Ranged humanoid
3. Armored humanoid
4. Humanoid caster
5. Undead humanoid
6. Humanoid/brute
7. Quadruped
8. Arachnid/crawler
9. Ooze
10. Spectral/floating
11. Plant/fungal
12. Golem/crystal brute
13. Drake/winged beast

Shared rigs are production templates only. Final silhouettes and attacks must remain immediately distinguishable in play.

## Art sprint order

### Sprint A — style and renderer proof

- Road Wolf
- Gutter Bombardier
- Bell Wraith
- Crystal Beast

These four validate quadruped, ranged humanoid, spectral, and large-creature pipelines against the existing boss/class art.

### Sprint B — first campaign half

- Remaining Frontier, Hollow, and Gloamfen mobs

### Sprint C — endgame campaign

- Keep, Frostvein, Rift, and World Eater mobs

### Sprint D — variants

- Seven named lieutenant skins
- Elite overlay package
- Golden Quarry package
- Nemesis Rank I–IV package

### Sprint E — polish

- Animation timing cleanup
- Attack event markers
- Hit-stop / particle sockets
- Integration screenshots and performance pass

## Git integration contract

This branch may add or change only:

- `assets/monsters/**`
- `assets/effects/enemies/**`
- `docs/art/**`
- monster art manifests or renderer adapters explicitly scoped to sprite loading

It must not edit networking, authentication, server sessions, save security, API routes, database migrations, or room authority. Integration into gameplay should be a separate PR after the art assets are approved.
