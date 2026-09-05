(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const canvas = byId("game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const ui = {
    loading: byId("loading"), statusText: byId("statusText"), status: document.querySelector(".status"),
    districtName: byId("districtName"), routeProgress: byId("routeProgress"),
    routeStops: [...document.querySelectorAll(".route-stop")], mission: byId("missionCard"),
    completion: byId("completionCard"), toast: byId("toast"), audio: byId("audioButton"),
    fullscreen: byId("fullscreenButton"), resultTime: byId("resultTime"),
    resultShards: byId("resultShards"), resultFalls: byId("resultFalls"),
  };

  const W = canvas.width;
  const H = canvas.height;
  const SEGMENT = 1282;
  const WORLD = SEGMENT * 3;
  const GROUND = 428;
  const SCALE = 1.3;

  const districts = [
    { name: "OLD QUARTER", key: "old", x: 0, y: -180 },
    { name: "TRANSIT WARD", key: "transit", x: SEGMENT, y: -92 },
    { name: "SKYLINE WORKS", key: "roof", x: SEGMENT * 2, y: -132 },
  ];
  const backgrounds = {
    old: "assets/city/city-background.png",
    transit: "assets/city/transit-district.png",
    roof: "assets/city/rooftop-district.png",
  };

  const platforms = [
    [0, GROUND, WORLD, 112, "ground"], [558, 362, 216, 15], [8, 290, 257, 14],
    [770, 262, 220, 14], [1161, 288, 121, 14], [1428, 350, 168, 14],
    [1686, 302, 155, 14], [1945, 350, 150, 14, "moveY", 78, 1.4],
    [2220, 312, 190, 14], [2470, 360, 94, 14], [2705, 345, 185, 14],
    [2980, 292, 154, 14], [3240, 350, 174, 14, "moveX", 72, 1.15],
    [3495, 298, 150, 14], [1320, 395, 75, 12], [2580, 388, 75, 12],
  ].map(([x, y, width, height, type, range = 0, speed = 0]) => ({
    x, y, width, height, type, range, speed, baseX: x, baseY: y, previousX: x,
  }));

  const checkpoints = [
    { x: 105, label: "OLD QUARTER" },
    { x: 1340, label: "TRANSIT WARD" },
    { x: 2620, label: "SKYLINE WORKS" },
  ];
  const shardSeeds = [
    [430, 382], [665, 320], [890, 220], [1512, 308], [1760, 260],
    [2300, 270], [2788, 303], [3060, 250], [3566, 256],
  ];
  const hazards = [[1040, 96], [1610, 58], [2135, 68], [2905, 58], [3436, 48]]
    .map(([x, width]) => ({ x, width }));
  const droneSeeds = [[1170, 352, 68, 1.2], [1870, 300, 90, 1.45], [3180, 285, 72, 1.6]];

  const player = {
    x: 105, y: GROUND, oldY: GROUND, vx: 0, vy: 0, facing: "east", state: "idle",
    grounded: true, platform: platforms[0], coyote: .1, buffer: 0, clock: 0, frame: 0,
    health: 3, invulnerable: 0,
  };
  const keys = new Set();
  const touch = new Set();
  const particles = [];
  const images = { bg: {}, idle: {}, walk: {}, run: {} };
  let shards = [];
  let drones = [];
  let camera = 0;
  let shake = 0;
  let district = 0;
  let checkpoint = 0;
  let elapsed = 0;
  let falls = 0;
  let started = false;
  let paused = false;
  let complete = false;
  let last = 0;
  let padJump = false;
  let toastTime = 0;
  let sound = false;
  let audioContext = null;
  let ambient = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ready = false;
  let padInteract = false;
  let walkTarget = null;
  const story = new window.LastNight({
    player, active: () => started && !paused && !complete,
    start: (resume) => { resetWorld(); startRun(resume); },
    clearInput: () => { keys.clear(); touch.clear(); walkTarget = null; player.vx = 0; player.buffer = 0; },
    chime: () => chord(440), heal: () => { player.health = 3; },
    snapshot: () => ({ x: player.x, y: player.y, elapsed, checkpoint, shards: shards.map(s => s.taken), falls }),
    restore: (s) => {
      player.x = clamp(Number(s.x) || 105, 20, WORLD - 20); player.y = Number(s.y) || GROUND;
      player.oldY = player.y; elapsed = Math.max(0, Number(s.elapsed) || 0);
      checkpoint = clamp(Number(s.checkpoint) || 0, 0, 2); falls = Math.max(0, Number(s.falls) || 0);
      shards.forEach((v, i) => { v.taken = !!s.shards?.[i]; });
      camera = clamp(player.x - W * .42, 0, WORLD - W);
    },
    finish: (choice) => {
      complete = true; player.vx = 0; ui.statusText.textContent = 'DAWN / STORY COMPLETE';
      byId('endingTitle').textContent = choice === 'tram' ? 'The last tram came home.' : 'The city found its voice.';
      byId('endingText').textContent = choice === 'tram' ? 'Eleven people stepped onto the platform. The transmitter waited for morning. Somewhere below, Inez put the kettle on.' : 'The rescue crew reached the tram by the stairs. Across the district, people heard each other again. Inez left her door open.';
      ui.resultTime.textContent = formatTime(elapsed); ui.resultShards.textContent = `${countShards()}/9`;
      ui.resultFalls.textContent = String(falls); ui.completion.hidden = false;
      byId('objective').hidden = true; byId('interactButton').hidden = true; successSound();
      byId('restartButton').focus();
    },
  });

  const framePaths = (folder) => Array.from({ length: 8 }, (_, i) =>
    `${folder}/frame_${String(i).padStart(3, "0")}.png`);
  const paths = {
    idle: { east: "assets/character/idle/east.png", west: "assets/character/idle/west.png" },
    walk: { east: framePaths("assets/character/walk/east"), west: framePaths("assets/character/walk/west") },
    run: { east: framePaths("assets/character/run/east"), west: framePaths("assets/character/run/west") },
  };

  function alphaBounds(image) {
    const probe = document.createElement("canvas");
    probe.width = image.width; probe.height = image.height;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    pctx.drawImage(image, 0, 0);
    const data = pctx.getImageData(0, 0, image.width, image.height).data;
    let minX = image.width, minY = image.height, maxX = 0, maxY = 0;
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      if (data[(y * image.width + x) * 4 + 3] > 24) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
    return { minX, minY, maxX, maxY };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { image.bounds = alphaBounds(image); resolve(image); };
      image.onerror = () => reject(new Error(`Could not load ${src}`));
      image.src = src;
    });
  }

  async function loadAssets() {
    await Promise.all(Object.entries(backgrounds).map(async ([key, src]) => { images.bg[key] = await loadImage(src); }));
    await Promise.all(["east", "west"].map(async (dir) => {
      images.idle[dir] = await loadImage(paths.idle[dir]);
      images.walk[dir] = await Promise.all(paths.walk[dir].map(loadImage));
      images.run[dir] = await Promise.all(paths.run[dir].map(loadImage));
    }));
  }

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const approach = (n, target, amount) => n < target ? Math.min(n + amount, target) : Math.max(n - amount, target);
  const countShards = () => shards.filter((item) => item.taken).length;
  const visible = (x, width = 1) => x + width > camera - 50 && x < camera + W + 50;
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  function resetWorld() {
    walkTarget = null;
    particles.length = 0; keys.clear(); touch.clear(); player.buffer = 0; player.clock = 0; player.frame = 0; player.state = 'idle';
    platforms.forEach(p => { p.x = p.baseX; p.y = p.baseY; p.previousX = p.x; p.previousY = p.y; });
    shards = shardSeeds.map(([x, y], i) => ({ x, y, phase: i * .7, taken: false }));
    drones = droneSeeds.map(([baseX, y, range, speed], i) => ({ baseX, x: baseX, y, range, speed, phase: i * 1.7, alive: true }));
    checkpoint = 0; district = 0; elapsed = 0; falls = 0; camera = 0; shake = 0;
    complete = false; paused = false; player.health = 3; player.invulnerable = 0;
    respawn(false); updateRoute();
  }

  function startRun(resume = false) {
    if (!ready) return;
    story.reset(resume === true);
    document.body.classList.add('playing');
    if (!audioContext) toggleSound();
    else { audioContext.resume(); ambient?.setPaused(false); }
    byId('objective').hidden = false; byId('interactButton').hidden = false; byId('pauseButton').hidden = false;
    started = true; paused = false; ui.mission.classList.add("dismissed");
    ui.statusText.textContent = "ROUTE ACTIVE"; last = performance.now();
    tone(440, .08, "square", .028); notify('FIND INEZ · E TO TALK'); canvas.focus();
  }

  function respawn(effect = true) {
    player.x = checkpoints[checkpoint].x; player.y = GROUND; player.oldY = GROUND;
    player.vx = 0; player.vy = 0; player.grounded = true; player.platform = platforms[0];
    player.facing = "east";
    if (effect) burst(player.x, player.y - 24, 20, "signal");
  }

  function input() {
    const pad = Array.from(navigator.getGamepads?.() || []).find(Boolean);
    return {
      left: keys.has("ArrowLeft") || keys.has("KeyA") || touch.has("left") || !!pad && (pad.axes[0] < -.28 || pad.buttons[14]?.pressed),
      right: keys.has("ArrowRight") || keys.has("KeyD") || touch.has("right") || !!pad && (pad.axes[0] > .28 || pad.buttons[15]?.pressed),
      run: keys.has("ShiftLeft") || keys.has("ShiftRight") || touch.has("run") || !!pad && (pad.buttons[2]?.pressed || pad.buttons[5]?.pressed),
      jump: !!pad && !!pad.buttons[0]?.pressed,
      interact: !!pad && !!pad.buttons[3]?.pressed,
    };
  }

  function queueJump() { player.buffer = .13; }
  function releaseJump() { if (player.vy < -190) player.vy *= .55; }

  function movePlatforms() {
    for (const p of platforms) {
      p.previousX = p.x;
      p.previousY = p.y;
      if (p.type === "moveY") p.y = p.baseY + Math.sin(elapsed * p.speed) * p.range;
      if (p.type === "moveX") p.x = p.baseX + Math.sin(elapsed * p.speed) * p.range;
    }
  }

  function update(dt) {
    if (!started || paused || complete) return;
    elapsed += dt;
    const controls = input();
    if (controls.interact && !padInteract) story.interact();
    padInteract = controls.interact;
    if (story.locked) return;
    toastTime = Math.max(0, toastTime - dt);
    if (!toastTime) ui.toast.classList.remove("visible");
    player.invulnerable = Math.max(0, player.invulnerable - dt); shake = Math.max(0, shake - dt * 28);
    if (controls.jump && !padJump) queueJump();
    if (!controls.jump && padJump) releaseJump();
    padJump = controls.jump;

    movePlatforms();
    if (player.grounded && player.platform?.type?.startsWith('move')) {
      player.x += player.platform.x - player.platform.previousX;
      player.y += player.platform.y - player.platform.previousY;
    }
    if (walkTarget !== null && Math.abs(walkTarget - player.x) < 8) walkTarget = null;
    const direction = controls.right || controls.left ? Number(controls.right) - Number(controls.left) : walkTarget === null ? 0 : Math.sign(walkTarget - player.x);
    player.vx = approach(player.vx, direction * (controls.run ? 300 : 180), (player.grounded ? 1850 : 980) * dt);
    if (direction) player.facing = direction > 0 ? "east" : "west";
    player.buffer = Math.max(0, player.buffer - dt);
    player.coyote = player.grounded ? .11 : Math.max(0, player.coyote - dt);
    if (player.buffer && player.coyote) {
      player.vy = -595; player.grounded = false; player.platform = null; player.coyote = 0; player.buffer = 0;
      burst(player.x, player.y, 8, "dust"); tone(190, .06, "square", .035);
    }

    player.oldY = player.y; player.x = clamp(player.x + player.vx * dt, 20, WORLD - 20);
    player.vy += 1670 * dt; player.y += player.vy * dt; player.grounded = false; player.platform = null;
    if (player.vy >= 0) {
      let landing = null;
      for (const p of platforms) {
        const within = player.x > p.x - 10 && player.x < p.x + p.width + 10;
        if (within && player.oldY <= p.y + 2 && player.y >= p.y && (!landing || p.y < landing.y)) landing = p;
      }
      if (landing) {
        const impact = player.vy; player.y = landing.y; player.vy = 0; player.grounded = true; player.platform = landing;
        if (impact > 390) { burst(player.x, player.y, 9, "dust"); shake = Math.min(5, impact / 120); tone(78, .04, "square", .02); }
      }
    }
    if (player.y > H + 120) { falls++; hit(true); }
    animate(dt); updateParticles(dt); updateDrones(); collect(); checkHazards(); checkCheckpoints(); story.tick(dt);
    camera += (clamp(player.x - W * .42, 0, WORLD - W) - camera) * Math.min(1, dt * 4.5);
    const next = Math.min(2, Math.floor((player.x + 80) / SEGMENT));
    if (next !== district) { district = next; updateRoute(); notify(districts[district].name); tone(330 + district * 90, .12, "triangle", .025); }
  }

  function animate(dt) {
    const old = player.state;
    player.state = !player.grounded ? (player.vy < -60 ? "rise" : "fall") : Math.abs(player.vx) > 235 ? "run" : Math.abs(player.vx) > 20 ? "walk" : "idle";
    if (old !== player.state) { player.clock = 0; player.frame = 0; }
    player.clock += dt;
    const rate = player.state === "run" ? 14 : 10;
    if (player.clock >= 1 / rate) {
      player.clock %= 1 / rate; player.frame = (player.frame + 1) % 8;
      if (player.grounded && player.state !== "idle" && [1, 5].includes(player.frame)) {
        burst(player.x, player.y, player.state === "run" ? 3 : 1, "dust"); tone(player.state === "run" ? 72 : 58, .025, "square", .01);
      }
    }
  }

  function updateDrones() {
    for (const drone of drones) {
      if (!drone.alive) continue;
      drone.x = drone.baseX + Math.sin(elapsed * drone.speed + drone.phase) * drone.range;
      if (Math.abs(player.x - drone.x) >= 29 || player.y <= drone.y - 35 || player.y >= drone.y + 28 || player.invulnerable) continue;
      if (player.vy > 120 && player.oldY < drone.y - 18) {
        drone.alive = false; player.vy = -390; burst(drone.x, drone.y, 18, "spark"); tone(130, .08, "sawtooth", .03);
      } else hit(false, drone.x);
    }
  }

  function collect() {
    for (const shard of shards) if (!shard.taken && Math.abs(player.x - shard.x) < 31 && Math.abs(player.y - 38 - shard.y) < 45) {
      shard.taken = true; burst(shard.x, shard.y, 14, "signal"); notify(`RELAY SHARD ${countShards()}/${shards.length}`); chord(520 + countShards() * 28);
    }
  }

  function checkHazards() {
    if (!player.grounded || player.invulnerable || player.y < GROUND - 3) return;
    const hazard = hazards.find((item) => !(story.safeTransit && item.x > SEGMENT && item.x < SEGMENT * 2) && player.x > item.x && player.x < item.x + item.width);
    if (hazard) hit(false, hazard.x + hazard.width / 2);
  }

  function checkCheckpoints() {
    const next = checkpoints.findIndex((item, i) => i > checkpoint && player.x >= item.x);
    if (next < 0) return;
    checkpoint = next; player.health = 3; notify(`CHECKPOINT — ${checkpoints[next].label}`);
    burst(checkpoints[next].x, GROUND - 30, 18, "signal"); chord(420 + next * 80);
  }

  function hit(fromFall, source = player.x) {
    if (player.invulnerable && !fromFall) return;
    player.health--; player.invulnerable = 1.25; shake = 9; burst(player.x, player.y - 30, 16, "spark"); tone(82, .18, "sawtooth", .045);
    if (fromFall || player.health <= 0) {
      if (!fromFall) falls++; player.health = 3; respawn(); notify("RETURNED TO CHECKPOINT");
    } else { player.vx = player.x < source ? -260 : 260; player.vy = -320; player.grounded = false; }
  }

  function burst(x, y, count, type) {
    const colors = { dust: ["#8191a5", "#56667b", "#ffb449"], spark: ["#ff4666", "#ffb449", "#fff"], signal: ["#3ff4ff", "#b8fbff", "#317c9c"] };
    for (let i = 0; i < count; i++) {
      const life = .24 + Math.random() * .38;
      particles.push({ x: x + (Math.random() - .5) * 22, y: y + (Math.random() - .5) * 16,
        vx: (Math.random() - .5) * (type === "signal" ? 150 : 95) - player.vx * .08,
        vy: -28 - Math.random() * (type === "signal" ? 150 : 90), gravity: type === "signal" ? 80 : 180,
        life, max: life, size: Math.random() > .62 ? 3 : 2, color: colors[type][Math.floor(Math.random() * colors[type].length)] });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.gravity * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#061022"; ctx.fillRect(0, 0, W, H);
    const sx = shake && !reducedMotion ? (Math.random() - .5) * shake : 0;
    const sy = shake && !reducedMotion ? (Math.random() - .5) * shake : 0;
    ctx.save(); ctx.translate(Math.round(sx), Math.round(sy));
    drawBackgrounds(); drawAtmosphere();
    ctx.save(); ctx.translate(-Math.round(camera), 0);
    drawSeams(); drawPlatforms(); drawCheckpoints(); drawHazards(); drawShards();
    drawDrones(); drawParticles(); drawExit(); story.draw(ctx, reducedMotion ? 0 : elapsed); drawPlayer();
    ctx.restore(); ctx.restore(); drawHud();
    if (paused) drawPause();
  }

  function drawBackgrounds() {
    for (const section of districts) {
      const x = section.x - camera;
      if (x > W || x + SEGMENT < 0) continue;
      ctx.drawImage(images.bg[section.key], Math.round(x), section.y, SEGMENT + 1, 720);
    }
    const shade = ctx.createLinearGradient(0, 210, 0, H);
    shade.addColorStop(0, "rgba(1,7,20,0)"); shade.addColorStop(1, "rgba(0,3,10,.25)");
    ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
  }

  function drawAtmosphere() {
    if (reducedMotion) return;
    const now = performance.now();
    if (district === 1) {
      ctx.strokeStyle = "rgba(104,184,255,.24)"; ctx.lineWidth = 1;
      for (let i = 0; i < 48; i++) {
        const x = (i * 83 + now * .4) % (W + 120) - 60;
        const y = (i * 47 + now * .64) % H;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 13); ctx.stroke();
      }
    } else if (district === 2) {
      ctx.fillStyle = "rgba(116,165,223,.18)";
      for (let i = 0; i < 16; i++) {
        const x = (i * 157 + now * .03) % (W + 80) - 40;
        ctx.fillRect(x, 90 + (i * 61) % 260, 17 + (i % 3) * 9, 1);
      }
    }
  }

  function drawSeams() {
    [SEGMENT, SEGMENT * 2].forEach((x) => {
      ctx.fillStyle = "rgba(2,7,15,.72)"; ctx.fillRect(x - 4, 0, 8, H);
      ctx.fillStyle = "rgba(63,244,255,.18)"; ctx.fillRect(x, 0, 1, H);
    });
  }

  function drawPlatforms() {
    for (const p of platforms) {
      if (p.type === "ground" || !visible(p.x, p.width)) continue;
      ctx.fillStyle = p.type?.startsWith("move") ? "rgba(9,23,35,.96)" : "rgba(4,9,17,.5)";
      ctx.fillRect(p.x, p.y + 3, p.width, p.height);
      ctx.fillStyle = p.type?.startsWith("move") ? "rgba(63,244,255,.86)" : "rgba(146,177,197,.62)";
      ctx.fillRect(p.x, p.y, p.width, 2);
      ctx.fillStyle = "rgba(12,27,42,.92)";
      for (let x = p.x + 7; x < p.x + p.width - 3; x += 18) ctx.fillRect(x, p.y + 6, 11, 2);
    }
  }

  function drawCheckpoints() {
    checkpoints.forEach((point, i) => {
      const active = i <= checkpoint;
      ctx.fillStyle = "#14253c"; ctx.fillRect(point.x - 2, GROUND - 69, 4, 69);
      ctx.fillStyle = active ? "#3ff4ff" : "#43526a"; ctx.fillRect(point.x - 7, GROUND - 75, 14, 12);
      if (active) {
        const pulse = .08 + (Math.sin(performance.now() * .006 + i) + 1) * .05;
        ctx.fillStyle = `rgba(63,244,255,${pulse})`; ctx.fillRect(point.x - 18, GROUND - 85, 36, 85);
      }
    });
  }

  function drawHazards() {
    hazards.forEach((hazard, i) => {
      if (story.safeTransit && hazard.x > SEGMENT && hazard.x < SEGMENT * 2) return;
      const bright = Math.sin(performance.now() * .018 + i * 2) > .15;
      ctx.fillStyle = "rgba(2,12,21,.75)"; ctx.fillRect(hazard.x, GROUND - 3, hazard.width, 5);
      ctx.fillStyle = bright ? "#ff796f" : "#9f4851";
      for (let x = hazard.x + 5; x < hazard.x + hazard.width - 4; x += 14) ctx.fillRect(x, GROUND - 5 - ((x + i) % 3) * 2, 7, 2);
    });
  }

  function drawShards() {
    shards.forEach((shard) => {
      if (shard.taken || !visible(shard.x, 30)) return;
      const y = shard.y + Math.sin(elapsed * 3 + shard.phase) * 6;
      ctx.save(); ctx.translate(shard.x, y); ctx.rotate(Math.PI / 4);
      ctx.shadowColor = "#3ff4ff"; ctx.shadowBlur = 14; ctx.fillStyle = "#3ff4ff"; ctx.fillRect(-7, -7, 14, 14);
      ctx.shadowBlur = 0; ctx.fillStyle = "#eaffff"; ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    });
  }

  function drawDrones() {
    drones.forEach((drone, i) => {
      if (!drone.alive || !visible(drone.x, 50)) return;
      const y = drone.y + Math.sin(elapsed * 4 + i) * 4;
      ctx.fillStyle = "rgba(0,3,10,.35)"; ctx.fillRect(drone.x - 17, y + 22, 34, 4);
      ctx.fillStyle = "#111b2b"; ctx.fillRect(drone.x - 18, y - 7, 36, 15);
      ctx.fillStyle = "#35455d"; ctx.fillRect(drone.x - 11, y - 12, 22, 23);
      ctx.fillStyle = "#ff4666"; ctx.fillRect(drone.x - 5, y - 4, 10, 6);
      ctx.fillStyle = "#ffb4c1"; ctx.fillRect(drone.x - 2, y - 3, 4, 3);
      ctx.fillStyle = "rgba(255,70,102,.18)"; ctx.fillRect(drone.x - 9, y + 11, 18, 18);
    });
  }

  function drawParticles() {
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function drawExit() {
    const x = WORLD - 68, ready = story.step === 12;
    const pulse = .5 + Math.sin(performance.now() * .008) * .22;
    ctx.fillStyle = "#13243a"; ctx.fillRect(x - 3, GROUND - 142, 6, 142);
    ctx.fillStyle = ready ? "#3ff4ff" : "#ff4666"; ctx.fillRect(x - 10, GROUND - 150, 20, 15);
    ctx.fillStyle = ready ? `rgba(63,244,255,${pulse * .15})` : "rgba(255,70,102,.08)";
    ctx.fillRect(x - 27, GROUND - 166, 54, 166);
  }

  function playerImage() {
    if (player.state === "idle") return images.idle[player.facing];
    if (player.state === "rise") return images.run[player.facing][2];
    if (player.state === "fall") return images.run[player.facing][5];
    return images[player.state === "run" ? "run" : "walk"][player.facing][player.frame];
  }

  function drawPlayer() {
    const image = playerImage(), b = image.bounds;
    const ax = (b.minX + b.maxX + 1) / 2, ay = b.maxY + 1;
    const x = Math.round(player.x - ax * SCALE), y = Math.round(player.y - ay * SCALE);
    ctx.fillStyle = "rgba(0,2,8,.36)"; ctx.beginPath();
    ctx.ellipse(player.x, player.y + 2, player.grounded ? 22 : 13, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (player.invulnerable && Math.floor(player.invulnerable * 14) % 2 === 0) ctx.globalAlpha = .35;
    ctx.drawImage(image, x, y, Math.round(image.width * SCALE), Math.round(image.height * SCALE)); ctx.globalAlpha = 1;
  }

  function drawHud() {
    if (!started || story.locked || complete) return;
    ctx.fillStyle = "rgba(8,12,20,.64)"; ctx.fillRect(18, 492, 260, 29);
    ctx.font = "10px monospace";
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < player.health ? "#e9ba78" : "#45505a"; ctx.fillRect(29 + i * 12, 503, 7, 7); }
    ctx.fillStyle = "#d5cec1"; ctx.fillText(`SIGNAL ${countShards()}/${shards.length}   ${formatTime(elapsed)}`, 77, 511);
  }

  function drawPause() {
    ctx.fillStyle = "rgba(2,6,14,.72)"; ctx.fillRect(0, 0, W, H); ctx.textAlign = "center";
    ctx.fillStyle = "#3ff4ff"; ctx.font = "10px monospace"; ctx.fillText("ROUTE SUSPENDED", W / 2, H / 2 - 24);
    ctx.fillStyle = "#fff"; ctx.font = "bold 42px Impact, sans-serif"; ctx.fillText("PAUSED", W / 2, H / 2 + 18);
    ctx.fillStyle = "#8b9bb6"; ctx.font = "10px monospace"; ctx.fillText("PRESS P TO CONTINUE", W / 2, H / 2 + 44); ctx.textAlign = "start";
  }

  function updateRoute() {
    if (ambient) ambient.chapter = story.current.chapter;
    ui.districtName.textContent = districts[district].name;
    ui.routeStops.forEach((stop, i) => stop.classList.toggle("active", i <= district));
    ui.routeProgress.style.width = `${clamp(player.x / (WORLD - 68) * 100, 0, 100)}%`;
    const target = story.current;
    byId('objectiveDistance').textContent = `${target.x < player.x - 65 ? '←' : target.x > player.x + 65 ? '→' : '◆'} ${Math.round(Math.abs(player.x - target.x) / 20)} m${Math.abs(player.y - target.y) > 24 ? (target.y < player.y ? ' · above you' : ' · below you') : ''}`;
  }

  function notify(message) {
    ui.toast.textContent = message; ui.toast.classList.add("visible"); toastTime = 1.7;
  }

  function tone(frequency, duration, type, volume) {
    if (!sound || !audioContext) return;
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
  }

  function chord(root) { [root, root * 1.25, root * 1.5].forEach((f, i) => setTimeout(() => tone(f, .11, "square", .018), i * 45)); }
  function successSound() { [330, 440, 550, 660].forEach((f, i) => setTimeout(() => tone(f, .18, "square", .025), i * 90)); }

  function toggleSound() {
    if (!audioContext) audioContext = new AudioContext();
    audioContext.resume();
    sound = !sound;
    if (!ambient) ambient = new window.NightScore(audioContext);
    ambient.setEnabled(sound);
    ui.audio.textContent = sound ? 'MUSIC ON' : 'MUSIC OFF'; ui.audio.setAttribute('aria-pressed', String(sound));
  }

  function togglePause() {
    if (!started || complete) return;
    paused = !paused; ui.statusText.textContent = paused ? "ROUTE PAUSED" : "ROUTE ACTIVE";
    byId('pauseButton').textContent = paused ? 'Resume [P]' : 'Pause [P]';
    ambient?.setPaused(paused);
    if (!paused) last = performance.now();
  }

  byId("startButton").addEventListener("click", () => startRun(false));
  byId("restartButton").addEventListener("click", () => { ui.completion.hidden = true; resetWorld(); startRun(); });
  ui.audio.addEventListener("click", toggleSound);
  byId('pauseButton').onclick = togglePause;
  ui.fullscreen.addEventListener("click", async () => {
    const frame = document.querySelector(".game-frame");
    if (!document.fullscreenElement) await frame.requestFullscreen?.(); else await document.exitFullscreen?.();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === 'KeyE' && !event.repeat) { event.preventDefault(); story.interact(); return; }
    if (event.code === 'Escape' && !event.repeat) { togglePause(); return; }
    if (event.code === 'KeyP' && !event.repeat) { togglePause(); return; }
    if (story.locked) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code)) walkTarget = null;
    keys.add(event.code);
    if (["Space", "ArrowUp", "KeyW"].includes(event.code) && !event.repeat) queueJump();
  });
  window.addEventListener("keyup", (event) => {
    keys.delete(event.code); if (["Space", "ArrowUp", "KeyW"].includes(event.code)) releaseJump();
  });
  window.addEventListener('blur', () => { keys.clear(); touch.clear(); if (started && !paused && !complete) togglePause(); });

  canvas.addEventListener('pointerdown', (event) => {
    if (!started || paused || complete || story.locked) return;
    const rect = canvas.getBoundingClientRect();
    walkTarget = clamp((event.clientX - rect.left) / rect.width * W + camera, 20, WORLD - 20);
    canvas.focus();
  });

  document.querySelectorAll("[data-control]").forEach((button) => {
    const name = button.dataset.control;
    const press = (event) => { event.preventDefault(); if (story.locked) return; button.setPointerCapture(event.pointerId); touch.add(name); button.classList.add("active"); if (name === "jump") queueJump(); };
    const release = (event) => { event.preventDefault(); touch.delete(name); button.classList.remove("active"); if (name === "jump") releaseJump(); };
    button.addEventListener("pointerdown", press); button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release); button.addEventListener("pointerleave", release);
  });

  function loop(now) {
    const dt = Math.min(.033, (now - last) / 1000 || 0); last = now;
    update(dt); updateRoute(); draw(); requestAnimationFrame(loop);
  }

  loadAssets().then(() => {
    ready = true; byId('startButton').disabled = false;
    resetWorld(); ui.loading.classList.add("hidden"); ui.status.classList.add("ready");
    ui.statusText.textContent = "CITY ONLINE"; requestAnimationFrame(loop);
  }).catch((error) => {
    ui.loading.querySelector("p").textContent = "ASSET LOAD FAILED"; ui.statusText.textContent = error.message.toUpperCase(); console.error(error);
  });
})();
