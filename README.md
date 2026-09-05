# Last Night

Last Night is a short side-scrolling pixel platformer set across a city during a blackout. You carry one borrowed battery through the Old Quarter, a stranded transit station, and the roofs of Skyline Works. Along the way, four people turn a broken route into a choice: bring eleven passengers down now, or restore the neighborhood's way to call for help.

The intended play time is 5–6 minutes. That is a design target, not a measured result.

## Play locally

The game has no package install and no build step. Clone the repository, then start a local HTTP server from the repository root so the browser serves the HTML and PNG assets from one origin:

```sh
git clone https://github.com/SpaceMan619/last-night.git
cd last-night
python3 -m http.server 4173
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) in a browser, then select **Begin the Night**.

Stop the server with `Ctrl-C` when you finish. There is no generated bundle to install.

## Controls

| Action | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | `A` / `D` or arrow keys | Left stick or D-pad | Left / right buttons |
| Run | Hold `Shift` | `X` or right bumper | Run button |
| Jump | `Space`, `W`, or up arrow | `A` | Up button |
| Talk / use | `E` | `Y` | Talk / use button |
| Pause | `P` or `Escape` | No gamepad binding | Pause button |

Gamepad labels follow the common Xbox layout. Browser gamepad support varies by device, and the game reads the first connected pad it can see. Touch controls appear on coarse-pointer devices; a narrow screen can make the dialogue and platforming lane feel crowded, so landscape orientation is recommended on phones. The soundtrack starts when you select **Begin the Night**, which supplies the browser gesture needed for audio. The **Music** toggle mutes or unmutes both the score and gameplay cues.

## The route

The story has 13 objectives across three acts:

1. **A shop with its lights still on**: meet Inez at the repair shop.
2. **Borrowed parts**: recover the converter from the low roof.
3. **A little borrowed light**: return the converter to Inez.
4. **The last tram**: reach Tomas at the station.
5. **Make the line safe**: isolate the flooded feeder.
6. **Follow the circuit**: reconnect the station cabinet in the right order.
7. **Someone at the far platform**: find Mina beyond the maintenance platforms.
8. **Walk her home**: escort Mina back to Tomas.
9. **Above the street**: meet Ada on the Skyline roof.
10. **Tune the west aerial**: solve the first roof circuit.
11. **Tune the east aerial**: cross the moving platform and solve the second circuit.
12. **What the light is for**: choose what receives the battery.
13. **One last connection**: carry the decision to the uplink.

Inez keeps the repair shop alive with a battery meant for her sign. Tomas is the station worker trying to bring a stalled tram down safely. Mina, his daughter, is waiting on the far platform. Ada keeps the rooftop aerials aligned and leaves the final decision to you. Their portraits are small pixel figures drawn in code so the prototype can carry a cast without another art pack.

The three districts have distinct city imagery and traversal beats:

- **Old Quarter** begins the route with low roofs, street hazards, and the repair shop.
- **Transit Ward** adds the station, moving platforms, a flooded feeder, and patrol drones.
- **Skyline Works** sends the player across aerials, cranes, and a moving roof platform toward the uplink.

There are nine relay shards placed above and between the main route. They are optional discoveries and never block story progress. The game tracks elapsed time, shards, and falls, with checkpoints at each district.

At the final choice, the player can power the tram's brake release or the neighborhood transmitter. Both endings are written as valid outcomes:

- **The last tram came home**: the eleven passengers reach the platform immediately, while the transmitter waits for morning.
- **The city found its voice**: the rescue crew receives the neighborhood's signal and comes up the stairs, while the tram remains held safely.

## What is in the folder

- `index.html`: page shell, mission cards, dialogue panel, route strip, and controls.
- `styles.css`: responsive layout, pixel-art presentation, HUD styling, and touch controls.
- `game.js`: Canvas rendering, platform physics, input, hazards, drones, checkpoints, shards, saving, and completion results.
- `story.js`: objective data, dialogue, NPC data, puzzles, escort behavior, the final choice, and ending text.
- `audio.js`: procedural WebAudio score and chapter harmony.
- `assets/character`: supplied east/west idle, walking, and running PNG frames.
- `assets/city`: district background PNGs used by the route.
- `ANIMATION-GUIDE.md`: export requirements for the next character animation pass.
- `docs/DESIGN.md`: the design record and production notes.

The current airborne player pose holds selected running frames. A dedicated jump set will make the takeoff, rise, fall, and landing read more clearly; the next animation priorities are recorded in `ANIMATION-GUIDE.md`.

## Asset provenance

The character PNGs came from the supplied downloads for this project. The city district PNGs were created for this prototype with the built-in image-generation workflow. These notes record where the files came from; they do not make an ownership or licensing claim. Add explicit credits and licenses before distributing a public release.

## Status

This is a self-contained browser prototype built with plain HTML, CSS, and JavaScript. It has no runtime package dependency. The game has been structured for a portfolio review: a readable story route, authored dialogue, distinct districts, responsive controls, and a clear handoff for future animation exports.

## Checks

The story checks run with Node's built-in test runner:

```sh
node --test tests/story.test.cjs
```

The current suite contains 11 passing tests covering the objective route, progression, puzzles, escort behavior, both endings, audio scheduling, music mute/pause/suspend behavior, and station and roof physics.
