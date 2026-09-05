const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const STORY_FILE = fs.readFileSync(path.join(ROOT, 'story.js'), 'utf8');
const STORY_CONSTRUCTOR = STORY_FILE.includes('window.LastNight') ? 'LastNight' : 'LastLight';
const SAVE_KEY = STORY_FILE.includes('last-night-v1') ? 'last-night-v1' : 'last-light-v1';

class ClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  toggle(value, force) {
    const next = force === undefined ? !this.values.has(value) : !!force;
    if (next) this.values.add(value); else this.values.delete(value);
    return next;
  }
  contains(value) { return this.values.has(value); }
}

class Element {
  constructor(id = '') {
    this.id = id;
    this.hidden = false;
    this.textContent = '';
    this.children = [];
    this.listeners = new Map();
    this.classList = new ClassList();
    this.attributes = new Map();
    this.style = {};
    this.dataset = {};
    this.onclick = null;
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  dispatchEvent(event) {
    for (const fn of this.listeners.get(event.type) || []) fn.call(this, event);
    return true;
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name); }
  focus() { this.focused = true; }
  click() {
    if (typeof this.onclick === 'function') this.onclick.call(this, { target: this });
    this.dispatchEvent({ type: 'click', target: this, preventDefault() {} });
  }
}

class CanvasContext {
  constructor() { this.imageSmoothingEnabled = false; this.fillStyle = ''; }
  drawImage() {}
  clearRect() {}
  fillRect() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  fill() {}
  ellipse() {}
  arc() {}
  save() {}
  restore() {}
  translate() {}
  scale() {}
  rotate() {}
  fillText() {}
  createLinearGradient() { return { addColorStop() {} }; }
  getImageData(_x, _y, width, height) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    return { data };
  }
}

class Canvas extends Element {
  constructor(id = '') {
    super(id);
    this.width = 960;
    this.height = 540;
    this.context = new CanvasContext();
  }
  getContext() { return this.context; }
}

class FakeImage {
  constructor() {
    this.width = 64;
    this.height = 64;
    this.onload = null;
    this.onerror = null;
  }
  set src(value) {
    this.srcValue = value;
    const animated = /frame_\d{3}\.png$/.test(value);
    this.width = animated ? 92 : 64;
    this.height = animated ? 92 : 64;
    if (typeof this.onload === 'function') this.onload();
  }
}

function makeHarness() {
  const elements = new Map();
  const ids = [
    'game', 'loading', 'statusText', 'districtName', 'routeProgress', 'missionCard',
    'completionCard', 'toast', 'audioButton', 'fullscreenButton', 'resultTime',
    'resultShards', 'resultFalls', 'startButton', 'continueButton', 'endingTitle',
    'endingText', 'objective', 'objectiveChapter', 'storyProgress', 'objectiveTitle',
    'objectiveHint', 'objectiveDistance', 'dialogue', 'portrait', 'speaker',
    'dialogueCount', 'dialogueText', 'dialogueActions', 'interactButton', 'pauseButton',
  ];
  for (const id of ids) elements.set(id, id === 'game' || id === 'portrait' ? new Canvas(id) : new Element(id));
  elements.get('loading').querySelector = () => new Element('loading-text');
  elements.get('startButton').disabled = false;
  const routeStops = [new Element('route-0'), new Element('route-1'), new Element('route-2')];
  const document = {
    body: new Element('body'),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element(id));
      return elements.get(id);
    },
    querySelector(selector) {
      if (selector === '.status') return elements.get('statusText');
      if (selector === '.game-frame') return new Element('game-frame');
      return new Element(selector);
    },
    querySelectorAll(selector) {
      if (selector === '.route-stop') return routeStops;
      if (selector === '[data-control]') return [];
      return [];
    },
    createElement(type) { return type === 'canvas' ? new Canvas() : new Element(); },
    fullscreenElement: null,
    exitFullscreen: async () => {},
  };
  const storageValues = new Map();
  const localStorage = {
    getItem(key) { return storageValues.has(key) ? storageValues.get(key) : null; },
    setItem(key, value) { storageValues.set(key, String(value)); },
    removeItem(key) { storageValues.delete(key); },
    clear() { storageValues.clear(); },
  };
  const window = {
    LastLight: null,
    NightScore: class {
      constructor() { this.chapter = 0; }
      setEnabled() {}
      setPaused() {}
    },
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
    removeEventListener() {},
  };
  const context = vm.createContext({
    window, document, localStorage, Image: FakeImage,
    navigator: { getGamepads: () => [] },
    performance: { now: () => 1000 },
    requestAnimationFrame: () => 0,
    setTimeout, clearTimeout, console,
    AudioContext: class {
      constructor() { this.currentTime = 0; this.destination = {}; }
      resume() {}
      createOscillator() {
        return {
          frequency: { value: 0 },
          connect: (node) => node,
          start() {},
          stop() {},
        };
      }
      createGain() {
        return {
          gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect: (node) => node,
        };
      }
    },
    Math, Date, Uint8ClampedArray,
  });
  vm.runInContext(STORY_FILE, context, { filename: 'story.js' });
  const gameSource = fs.readFileSync(path.join(ROOT, 'game.js'), 'utf8');
  const marker = '\n})();';
  const end = gameSource.lastIndexOf(marker);
  assert.notEqual(end, -1, 'game.js should end in its IIFE close');
  const injected = `
  window.__gameTest = {
    story, player, platforms, keys, ui,
    get ready() { return ready; },
    get shards() { return shards; },
    get drones() { return drones; },
    get elapsed() { return elapsed; },
    get complete() { return complete; },
    get started() { return started; },
    resetWorld, startRun, update, queueJump, releaseJump, movePlatforms,
    setStoryStep(step) { story.step = step; story.dialog = null; story.finished = false; story.refresh(); },
    setElapsed(value) { elapsed = value; },
  };
`;
  vm.runInContext(gameSource.slice(0, end) + injected + gameSource.slice(end), context, { filename: 'game.js' });
  return { context, elements, localStorage, game: window.__gameTest };
}

const harness = makeHarness();
const { game, elements, localStorage } = harness;

async function settle() {
  await new Promise((resolve) => setImmediate(resolve));
  await Promise.resolve();
}

function resetRun() {
  game.resetWorld();
  game.startRun(false);
  assert.equal(game.started, true);
  assert.equal(game.story.step, 0);
}

function placeAtCurrent({ near = true, minaNear = true } = {}) {
  const objective = game.story.current;
  game.player.x = objective.x + (near ? 0 : 66);
  game.player.y = objective.y;
  game.player.oldY = objective.y;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.player.platform = game.platforms.find((p) => Math.abs(p.y - objective.y) < 2 && game.player.x > p.x - 10 && game.player.x < p.x + p.width + 10) || game.platforms[0];
  if (game.story.current.kind === 'escort' && minaNear) game.story.minaX = objective.x;
}

function advanceTalk() {
  assert.equal(game.story.dialog?.mode, 'talk');
  const count = game.story.dialog.entries.length;
  for (let i = 0; i < count; i++) game.story.next();
}

function clickAction(index) {
  const actions = elements.get('dialogueActions');
  assert.ok(actions.children[index], `dialogue action ${index} should exist`);
  actions.children[index].click();
}

async function startHarness() {
  await settle();
  assert.equal(game.ready, true, 'all game assets should be ready before exercising the route');
}

test('all 13 objectives can be reached in order and their dialogue advances', async () => {
  await startHarness();
  resetRun();
  const expectedTitles = [
    'A shop with its lights still on', 'Borrowed parts', 'A little borrowed light',
    'The last tram', 'Make the line safe', 'Follow the circuit',
    'Someone at the far platform', 'Walk her home', 'Above the street',
    'Tune the west aerial', 'Tune the east aerial', 'What the light is for',
    'One last connection',
  ];
  assert.equal(game.story.current.title, expectedTitles[0]);
  for (let step = 0; step < expectedTitles.length; step++) {
    game.setStoryStep(step);
    assert.equal(game.story.current.title, expectedTitles[step]);
    placeAtCurrent({ near: false });
    game.story.interact();
    assert.equal(game.story.dialog, null, `objective ${step + 1} should require proximity`);
    placeAtCurrent();
    game.story.interact();
    if (step === 5 || step === 9 || step === 10) {
      advanceTalk();
      assert.equal(game.story.dialog.mode, 'puzzle');
      const sequence = game.story.dialog.sequence.slice();
      if (step === 5) {
        clickAction((sequence[0] + 1) % 3);
        assert.deepEqual(Array.from(game.story.dialog.entered), [], 'a wrong circuit input resets the breaker safely');
      }
      for (const value of sequence) clickAction(value);
      assert.equal(game.story.step, step + 1);
    } else if (step === 11) {
      advanceTalk();
      assert.equal(game.story.dialog.mode, 'choice');
      clickAction(0);
      assert.equal(game.story.step, step + 1);
      assert.equal(game.story.choice, 'tram');
    } else if (step === 12) {
      assert.equal(game.story.dialog.mode, 'talk');
      advanceTalk();
      assert.equal(game.story.finished, true);
      assert.equal(game.complete, true);
    } else {
      advanceTalk();
      assert.equal(game.story.step, Math.min(step + 1, 12));
    }
  }
});

test('puzzle sequences recover after failure and both endings finish cleanly', () => {
  resetRun();
  for (const step of [5, 9, 10]) {
    game.setStoryStep(step);
    placeAtCurrent();
    game.story.interact();
    advanceTalk();
    const sequence = game.story.dialog.sequence.slice();
    clickAction((sequence[0] + 1) % 3);
    assert.deepEqual(Array.from(game.story.dialog.entered), []);
    for (const value of sequence) clickAction(value);
    assert.equal(game.story.step, step + 1);
  }

  for (const choice of ['tram', 'radio']) {
    resetRun();
    game.setStoryStep(12);
    game.story.choice = choice;
    placeAtCurrent();
    game.story.interact();
    assert.equal(game.story.dialog.mode, 'talk');
    advanceTalk();
    assert.equal(game.story.finished, true);
    assert.equal(game.complete, true);
    assert.match(elements.get('endingTitle').textContent, choice === 'tram' ? /tram/ : /voice/);
    game.setStoryStep(0);
    assert.equal(game.complete, true, 'setting story state alone must not erase game completion');
  }
});

test('save resume restores the active objective and reset starts a clean story', () => {
  resetRun();
  game.setStoryStep(7);
  game.story.minaX = 1712;
  game.player.x = 1640;
  game.player.y = 428;
  game.setElapsed(93.5);
  game.story.save();
  assert.ok(localStorage.getItem(SAVE_KEY));

  game.story.reset(true);
  assert.equal(game.story.step, 7);
  assert.equal(game.story.minaX, 1712);
  assert.equal(game.elapsed, 93.5);
  assert.equal(game.player.x, 1640);
  assert.equal(game.story.dialog, null);

  game.story.reset(false);
  assert.equal(game.story.step, 0);
  assert.equal(game.story.choice, '');
  assert.equal(game.story.minaX, 2370);
  assert.equal(game.story.dialog, null);
});

test('escort waits when Mina is too far, follows while travelling, and can be completed', () => {
  resetRun();
  game.setStoryStep(7);
  game.player.x = 1450;
  game.player.y = 428;
  game.player.grounded = true;
  game.story.minaX = 2370;
  game.story.tick(1);
  assert.equal(game.story.minaX, 2370, 'Mina waits until the player is within following distance');

  game.player.x = 2200;
  game.story.tick(1);
  assert.equal(game.story.minaX, 2306, 'Mina follows toward the player at her capped walking speed');

  game.story.minaX = 1500;
  game.player.x = 1450;
  game.story.interact();
  assert.equal(game.story.dialog.mode, 'talk');
  advanceTalk();
  assert.equal(game.story.step, 8);
});

test('the lowest maintenance ledge is reachable with a real jump', () => {
  resetRun();
  const low = game.platforms.find((p) => p.x === 1320);
  const next = game.platforms.find((p) => p.x === 1428);
  game.player.x = low.x + 10;
  game.player.y = low.y;
  game.player.oldY = low.y;
  game.player.grounded = true;
  game.player.platform = low;
  game.keys.add('KeyD');
  game.queueJump();
  let landedOnNext = false;
  for (let i = 0; i < 120; i++) {
    game.update(1 / 60);
    if (game.player.grounded && game.player.platform === next) { landedOnNext = true; break; }
  }
  game.keys.delete('KeyD');
  assert.equal(landedOnNext, true);
});

test('vertical moving platform carries a grounded player', () => {
  resetRun();
  const mover = game.platforms.find((p) => p.type === 'moveY');
  game.setElapsed(0);
  game.player.x = mover.x + 30;
  game.player.y = mover.y;
  game.player.oldY = mover.y;
  game.player.grounded = true;
  game.player.platform = mover;
  const oldY = game.player.y;
  game.update(0.2);
  assert.notEqual(mover.y, mover.baseY);
  assert.equal(game.player.platform, mover);
  assert.equal(game.player.y, mover.y);
  assert.notEqual(game.player.y, oldY);
});

function makeAudioHarness() {
  const scheduled = { oscillators: [], hats: [], intervals: [] };
  const node = () => ({
    connections: [],
    connect(target) { this.connections.push(target); return target; },
    disconnect() { this.disconnected = true; },
  });
  const gain = () => {
    const n = node();
    n.gain = {
      value: 0,
      targets: [],
      setValueAtTime(value, when) { this.value = value; this.lastSet = { value, when }; },
      exponentialRampToValueAtTime(value, when) { this.value = value; this.lastRamp = { value, when }; },
      setTargetAtTime(value, when, constant) { this.value = value; this.targets.push({ value, when, constant }); },
    };
    return n;
  };
  const context = {
    currentTime: 0,
    sampleRate: 8000,
    state: 'running',
    destination: node(),
    createGain: gain,
    createDynamicsCompressor: node,
    createDelay: () => { const n = node(); n.delayTime = { value: 0 }; return n; },
    createBiquadFilter: () => { const n = node(); n.frequency = { value: 0 }; return n; },
    createOscillator: () => {
      const n = node(); n.frequency = { value: 0 }; n.type = '';
      n.start = (when) => { n.startTime = when; scheduled.oscillators.push(n); };
      n.stop = (when) => { n.stopTime = when; };
      return n;
    },
    createBuffer: (_channels, length) => ({ getChannelData: () => new Float32Array(length) }),
    createBufferSource: () => {
      const n = node();
      n.start = (when) => { n.startTime = when; scheduled.hats.push(n); };
      return n;
    },
  };
  const window = {};
  const vmContext = vm.createContext({ window, Math, Float32Array, setInterval: (fn) => { scheduled.intervals.push(fn); return scheduled.intervals.length; }, clearInterval() {} });
  const source = fs.readFileSync(path.join(ROOT, 'audio.js'), 'utf8');
  vm.runInContext(source, vmContext, { filename: 'audio.js' });
  return { context, scheduled, Score: window.NightScore };
}

test('NightScore schedules bounded musical events as time advances', () => {
  const { context, scheduled, Score } = makeAudioHarness();
  const score = new Score(context);
  assert.equal(scheduled.intervals.length, 1, 'the score should own one bounded scheduler');
  context.currentTime = 0.2;
  score.schedule();
  const firstStep = score.step;
  assert.ok(firstStep > 0);
  assert.ok(scheduled.oscillators.length > 0);
  assert.ok(scheduled.oscillators.every((oscillator) => oscillator.startTime >= 0.08));
  context.currentTime = 0.8;
  scheduled.intervals[0]();
  assert.ok(score.step > firstStep);
  assert.ok(scheduled.oscillators.some((oscillator) => oscillator.startTime > 0.2));
});

test('NightScore mute and pause target the music bus gain', () => {
  const { context, Score } = makeAudioHarness();
  const score = new Score(context);
  score.setEnabled(false);
  assert.equal(score.bus.gain.targets.at(-1).value, 0);
  score.setEnabled(true);
  score.setPaused(true);
  assert.equal(score.bus.gain.targets.at(-1).value, 0.035);
  score.setPaused(false);
  assert.equal(score.bus.gain.targets.at(-1).value, 0.2);
});

test('NightScore suspension skips scheduling and resume does not replay a backlog', () => {
  const { context, scheduled, Score } = makeAudioHarness();
  const score = new Score(context);
  context.state = 'suspended'; context.currentTime = 30;
  score.schedule();
  assert.equal(score.step, 0);
  assert.equal(scheduled.oscillators.length, 0);
  context.state = 'running';
  score.schedule();
  assert.ok(score.step > 0);
  assert.ok(scheduled.oscillators.every((oscillator) => oscillator.startTime >= 30.04));
});

function jumpBetween(from, to) {
  game.resetWorld();
  game.startRun(false);
  // Start at the takeoff edge so the test exercises the intended traversal gap.
  game.player.x = from.x + from.width - 5;
  game.player.y = from.y;
  game.player.oldY = from.y;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.player.platform = from;
  game.player.invulnerable = 10;
  game.keys.add('KeyD');
  game.keys.add('ShiftLeft');
  game.queueJump();
  let reached = false;
  for (let i = 0; i < 180; i++) {
    game.update(1 / 60);
    if (game.player.grounded && game.player.platform === to) { reached = true; break; }
  }
  game.keys.delete('KeyD');
  game.keys.delete('ShiftLeft');
  return reached;
}

test('station switch ledge is reachable from the lower station platform', () => {
  const from = game.platforms.find((p) => p.x === 1428);
  const to = game.platforms.find((p) => p.x === 1686);
  assert.ok(from && to);
  assert.equal(jumpBetween(from, to), true);
});

test('rooftop aerial ledge is reachable across the service gap', () => {
  game.resetWorld();
  const from = game.platforms.find((p) => p.x === 3240);
  const to = game.platforms.find((p) => p.x === 3495);
  assert.ok(from && to);
  assert.equal(jumpBetween(from, to), true);
});
