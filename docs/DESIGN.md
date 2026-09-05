# Last Night: design record

Last Night is a compact story platformer about ordinary people keeping a city connected during a blackout. Its scale stays deliberately small: one side-on route, one borrowed battery, a handful of hazards, and a choice that changes what the battery does. The player should finish with a sense of having carried a problem between people, rather than having cleared a checklist.

## Player promise

The first few minutes teach the whole game. Run, jump, land on a roof, speak to someone, and bring a part back. The route then asks for slightly more trust: cross an unsafe gap, follow a wiring order, escort Mina without leaving her behind, and climb to the aerials. Each step grows out of the previous conversation, so the movement has a reason to exist.

The target session is 5–6 minutes. The project has not measured that time across players, devices, or input methods, so it remains a pacing goal rather than a performance claim.

## Story structure

The 13 objectives form three acts.

### Act 1: Borrowed Light

The player meets Inez, learns that her sign battery can help the stranded tram, retrieves a converter, and brings it back to the shop. This act establishes the game's emotional scale: the repair is improvised, local, and worth doing because people are waiting.

### Act 2: The Last Tram

Tomas explains that eleven passengers are stuck above the station while his daughter Mina searches for a signal. The player isolates the flooded feeder, reconnects the cabinet, finds Mina, and walks her back to Tomas. A simple wiring puzzle gives the station problem a tactile beat; the escort changes the pace by asking the player to stay near another character.

### Act 3: A Way Home

Ada explains the cost of the final decision. The player aligns two aerials, then chooses between immediate brake control for the tram and a transmitter that can call the wider neighborhood for help. The ending stays humane in both branches: the choice changes timing and reach, not whether the characters deserve to get home.

## Cast

Inez runs the repair shop. She is practical, funny when she is tired, and attached to a battery built for a glowing sign. Her dialogue gives the blackout a lived-in scale.

Tomas maintains the station. He knows the equipment, distrusts its labels, and keeps talking because silence would make the trapped passengers feel farther away.

Mina is Tomas's daughter. She is capable and frightened in equal measure; her escort objective turns that tension into a movement rule.

Ada keeps the Skyline Works aerials aligned. She understands the system well enough to explain the choice, then steps aside so the player owns it.

The NPC portraits use small code-drawn pixel silhouettes with distinct coats, hair, and props. That choice keeps the prototype self-contained and leaves room to replace them with authored sprite art later.

## Districts and traversal

The world is one continuous horizontal Canvas route split into three 1,282-pixel districts:

- Old Quarter starts on the ground and introduces low roofs, the first converter, hazards, and a relay shard route.
- Transit Ward shifts upward around the station. A moving vertical platform, electrical hazards, and a patrol drone make the repair objective feel exposed.
- Skyline Works moves onto rooftops and aerial platforms. A horizontal moving platform and two circuit objectives lead to the uplink.

Checkpoints sit near the start of each district. Falling or losing all health returns the player to the latest checkpoint, restores three health, and counts a fall. The route can be replayed without a separate level load.

Nine shards reward looking above the direct path. They are optional, so a player who follows the story can reach the ending without stopping to collect them. The completion card records shards, falls, and time so a second run has a reason to be cleaner.

## Movement feel

The player accelerates toward a walk or run speed instead of snapping instantly to it. Holding jump controls height, while a short coyote window and jump buffer make ledges forgiving. Moving platforms carry the player while grounded. Hazards damage the player, briefly grant invulnerability, and push them away from the hit.

The character art only needs east and west directions for this side-on game. Idle uses the supplied 64×64 PNGs; walking and running use the supplied eight-frame 92×92 sequences. The renderer measures each image's opaque bounds and anchors the feet to the world position, which keeps the different source canvas sizes from making the character hop between states.

Airborne movement currently holds selected running poses. A dedicated jump animation should replace that placeholder once exported. The animation handoff lives in `ANIMATION-GUIDE.md` and asks for matching east/west frames, a stable baseline, and transparent PNGs.

## Interaction and input

The story uses `E` or the gamepad `Y` for conversations, parts, circuit panels, choices, and the uplink. Keyboard movement accepts `A` / `D`, arrow keys, and `W` for jump; `Shift` runs; `P` or `Escape` pauses. Touch exposes left, right, run, jump, interaction, and pause buttons. The gamepad uses the left stick or D-pad for movement, `A` for jump, and `X` or the right bumper for run.

The browser decides which controller labels appear physically, and gamepad support differs between browsers. Pause has no gamepad shortcut in this build. On touch screens, the controls reduce the available view and dialogue can cover part of the play area; the layout remains usable, but the desktop presentation is the reference experience.

## Visual and audio direction

The city uses dark blue night tones, warm windows, cyan relay light, and red electrical hazards. Background PNGs carry the district identity while Canvas draws the playable surfaces, shards, drones, signals, and particles in a restrained pixel language. The player remains readable against the sky and building silhouettes because the interaction markers and cyan route elements share a small accent palette.

Sound is optional. Selecting **Begin the Night** starts a procedural WebAudio instrumental soundtrack after the browser gesture, with harmony that shifts with the current chapter and short cues for jumps, hits, shards, puzzles, district changes, and completion. The **Music** toggle mutes or unmutes both the score and gameplay cues.

## Technical shape

The prototype uses five runtime files:

- `index.html` provides the shell and accessible labels.
- `styles.css` handles the page frame and responsive controls.
- `game.js` owns the main loop, rendering, physics, and asset loading.
- `story.js` holds authored story data and the story controller used by the game loop.
- `audio.js` owns the procedural score and chapter harmony. Gameplay cues live in `game.js`.

There is no package manager, bundler, or runtime library. Clone the repository, enter its root, and serve it with `python3 -m http.server 4173`; the browser then loads the local PNG assets under the same origin. Local save data uses `localStorage` under the prototype's story key. Completing a route clears its saved story state, and browser site data can clear it as well. The story checks run with `node --test tests/story.test.cjs`; the current suite has 11 passing tests covering story progression, puzzles, escort behavior, endings, audio scheduling and mute/pause/suspend behavior, plus station and roof physics.

## Next production pass

The largest visual improvement is a real jump set with takeoff, rise, apex, fall, and landing. After that, a slide or crouch set can give the route more movement variety, while a pickup pose would make the relay shards feel physical. Combat animations can wait until the game has enemies that need a readable attack beat.

The NPC silhouettes, district art, and synthesized audio are prototype layers. A portfolio release can replace them with final commissioned or authored assets after rights and credits are decided, then add playtime measurement across keyboard, touch, and gamepad runs.

## Asset and rights note

The character frames were supplied for this project. The city images were generated for this prototype with the built-in image-generation workflow. This design record describes provenance and intended use; it does not infer ownership or grant a license. Confirm the rights for every asset before publishing a public build.
