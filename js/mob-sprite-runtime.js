/* ASHFALL common-mob sprite runtime pilot.
   Isolated from game.js so security/session work can proceed independently.
   Consumers may import or copy this runtime during renderer integration. */
(() => {
  'use strict';

  const DEFAULT_MANIFEST_URL = 'assets/monsters/manifest.v1.json';
  const cache = new Map();

  async function loadJson(url) {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return response.json();
  }

  async function loadImage(url) {
    if (cache.has(url)) return cache.get(url);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load sprite atlas ${url}`));
      image.src = url;
    });
    cache.set(url, promise);
    return promise;
  }

  class MobSpriteLibrary {
    constructor(manifestUrl = DEFAULT_MANIFEST_URL) {
      this.manifestUrl = manifestUrl;
      this.manifest = null;
      this.meta = new Map();
      this.images = new Map();
    }

    async init() {
      this.manifest = await loadJson(this.manifestUrl);
      const entries = Object.entries(this.manifest.enemies)
        .filter(([, entry]) => entry.status === 'pilot-ready' && entry.atlas && entry.metadata);
      await Promise.all(entries.map(async ([kind, entry]) => {
        const [meta, image] = await Promise.all([loadJson(entry.metadata), loadImage(entry.atlas)]);
        this.meta.set(kind, meta);
        this.images.set(kind, image);
      }));
      return this;
    }

    has(kind) {
      return this.meta.has(kind) && this.images.has(kind);
    }

    animationRow(meta, animation, facing) {
      const direction = facing === 'west' || facing === 'east' ? 'side' : facing;
      return meta.animations?.[animation]?.rows?.[direction] ?? 0;
    }

    draw(ctx, enemy, {
      animation = 'idle',
      facing = enemy?.facing || 'south',
      now = performance.now(),
      x,
      y,
      width = 64,
      height = 64,
      alpha = 1
    } = {}) {
      const kind = enemy?.kind;
      const meta = this.meta.get(kind);
      const image = this.images.get(kind);
      if (!meta || !image) return false;

      const spec = meta.animations[animation] || meta.animations.idle;
      const frame = spec.loop
        ? Math.floor((now / 1000) * spec.fps) % spec.frames
        : Math.min(spec.frames - 1, Math.floor(((now - (enemy.animStarted || now)) / 1000) * spec.fps));
      const row = this.animationRow(meta, animation, facing);
      const sx = frame * meta.frameWidth;
      const sy = row * meta.frameHeight;
      const mirror = facing === 'west';

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = false;
      if (mirror) {
        ctx.translate((x ?? 0) + width, y ?? 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image, sx, sy, meta.frameWidth, meta.frameHeight, 0, 0, width, height);
      } else {
        ctx.drawImage(image, sx, sy, meta.frameWidth, meta.frameHeight, x ?? 0, y ?? 0, width, height);
      }
      ctx.restore();
      return true;
    }
  }

  globalThis.AshfallMobSprites = {
    MobSpriteLibrary,
    DEFAULT_MANIFEST_URL
  };
})();
