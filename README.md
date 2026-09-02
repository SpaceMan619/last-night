# City Runner

City Runner is a short side-scrolling pixel platformer built around a supplied character sprite set. The route crosses an old city block, a rain-soaked transit ward, and a rooftop district before ending at the city uplink.

The game runs in plain HTML, CSS, and Canvas JavaScript. It has no package install or build step.

## Play locally

Open `index.html`, or start a local server from this folder:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | `A` / `D` or arrow keys | Left stick or D-pad |
| Run | `Shift` | X or right bumper |
| Jump | `Space`, `W`, or up arrow | A |
| Pause | `P` | Keyboard only |

Touch buttons appear on coarse-pointer devices. Sound starts muted.

## Current build

- Three connected city districts with separate background art
- Nine relay shards; collect six to open the final uplink
- Moving platforms, electrical hazards, patrol drones, health, and checkpoints
- Walk/run state changes, variable-height jumping, coyote time, and jump buffering
- Desktop, touch, and gamepad input
- Pause, fullscreen, optional synthesized sound, particles, screen shake, route progress, and timed results
- Alpha-aware foot anchoring across the 64×64 idle art and 92×92 movement frames

## Character art

The current build uses east/west idle, walking, and running PNG sequences. Airborne movement temporarily holds selected running poses. See [`ANIMATION-GUIDE.md`](ANIMATION-GUIDE.md) for the next sprite exports and file requirements.

## Files

- `index.html`: page structure and game overlays
- `styles.css`: responsive shell, route display, and touch controls
- `game.js`: physics, rendering, input, collisions, objectives, audio, and game state
- `assets/character`: supplied character frames
- `assets/city`: original city district art

No license has been assigned because the character art belongs to the project owner.
