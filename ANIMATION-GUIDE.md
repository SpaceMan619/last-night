# Character animation handoff

City Runner only needs left- and right-facing motion. If the outfit remains symmetrical, generate one direction and mirror it; otherwise export both sides so the turban, shoes, and clothing details stay correct.

## Generate next

### 1. Jumping

Make this first. A good platformer jump needs a readable takeoff, rising pose, apex, fall, and landing. If the site's stock Jumping option compresses those beats too much, use Custom Animation V3 with this prompt:

> Side-view platformer jump with clear takeoff, rising pose, apex, falling pose, and soft two-foot landing. Preserve the character's outfit, body proportions, turban, and facial features. Keep the feet on a consistent baseline and don't move the character horizontally inside the canvas.

Target: 7–10 frames per direction.

### 2. Slide

Use the stock Slide animation. It should start from a run, lower the full silhouette, then return to standing without drifting across the frame.

Target: 6–8 frames per direction.

### 3. Crouching

A short transition plus a held crouch pose will support low obstacles. Four frames down and the same frames reversed work well.

### 4. Picking Up

The current mission uses floating relay shards, so a pickup pose can add weight to special collectibles even though ordinary shards trigger on contact.

Target: 5–7 frames per direction.

## Add when combat starts

Pick either Punching or Kicking first, not both. One clean attack with startup, contact, and recovery frames gives the code enough timing information for a hitbox. Add Falling Back Death after that for a proper failure state.

## Export rules

- PNG with transparency
- 92×92 canvas for every movement frame
- Identical foot baseline and horizontal center across the set
- No camera movement, baked shadow, background, motion blur, or extra particles
- Stable outfit colors and proportions
- Sequential filenames beginning at `frame_000.png`

Suggested folders:

```text
assets/character/
  jump/east/
  jump/west/
  slide/east/
  slide/west/
  crouch/east/
  crouch/west/
  pickup/east/
  pickup/west/
```

Running, walking, and idle already cover the base movement loop. Full Sprint can wait unless the game gets a separate dash or stamina mechanic.
