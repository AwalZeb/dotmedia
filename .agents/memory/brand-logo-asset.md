---
name: Brand logo asset handling
description: How the Dot Media logo mark is prepared and displayed; read before touching the logo, favicon, or share-image assets.
---

# Brand logo asset handling

The user's only logo source is a 1080x1080 square "profile" PNG with an **opaque near-black background and a red radial glow** (kept in `attached_assets/`). The user ruled background removal and logo regeneration out of scope and chose to replace the text logo with this mark (not a hero graphic).

**Decision:** serve an opaque crop (`920x920+80+80` of the source, downsized) and let CSS blend it: the displayed mark uses a radial `mask-image` that stays opaque to ~84% of the half-width and fades to transparent at the edges. The mark's farthest pixel is ~80% of that crop's half-width, so the mask never clips artwork while hiding the square edge on dark backgrounds.

**Why:** the glow is still visibly reddish at the crop edges, so an unmasked square reads as a dark-red tile on the #0a0a0a header/footer. Baking transparency into the file was rejected because the same file is also the schema.org Organization logo, which should look right on white.

**How to apply:** regenerate derived assets (favicon, OG/share image) from the source PNG, not from the served logo. For a tighter crop, the mark's bounding box in the source is roughly `640x581+220+249`; re-derive the mask stop if the crop ratio changes. The header lockup keeps the brand name and tagline as text next to the mark — the user has not asked for an icon-only header.
