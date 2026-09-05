/* Last Light: authored objectives, dialogue and characters. No network dependencies. */
(() => {
  'use strict';
  const lines = (...entries) => entries.map(([name, text]) => ({ name, text }));
  const steps = [
    { title: 'A shop with its lights still on', hint: 'Find Inez outside the repair shop. E to talk.', x: 255, y: 428, who: 'Inez', kind: 'talk', chapter: 0,
      lines: lines(['Inez', "You picked a terrible evening to take the long way home. The last tram is stuck above the station, and every phone on this block is dead."], ['You', "Your shop still has power."], ['Inez', "One battery. I built it for the sign. Seventeen years fixing everyone’s appliances, and apparently my greatest contribution is a glowing kettle."], ['You', "Can it start the tram?"], ['Inez', "With a converter, maybe. There’s one in the green service box on that low roof. Take the awning up. And hold your jump if you need the height."]) },
    { title: 'Borrowed parts', hint: 'Jump onto the low roof and recover the converter.', x: 665, y: 362, kind: 'item', chapter: 0,
      lines: lines(['You', "Converter. Mostly dry. That feels like a good sign."], ['Inez · radio', "Mostly is better than usual. Bring it back; the battery connector needs a steady hand, and I know exactly how unsteady mine is after six coffees."]) },
    { title: 'A little borrowed light', hint: 'Return the converter to Inez.', x: 255, y: 428, kind: 'talk', who: 'Inez', chapter: 0,
      lines: lines(['Inez', "There. Battery, converter, and a radio with one working channel. The man at the station is Tomas. Tell him I want my battery back."], ['You', "And if he asks what it’s for?"], ['Inez', "Tell him it’s for getting people home. He’ll understand. There’s a live cable past the shop; jump over the red sparks. Those patrol units have lost their instructions, too. Best give them room."], ['You', "I’ll bring it back."], ['Inez', "Bring yourself back. We can argue about the battery tomorrow."]) },
    { title: 'The last tram', hint: 'Cross the live cable and find Tomas at the station.', x: 1450, y: 428, who: 'Tomas', kind: 'talk', chapter: 1,
      lines: lines(['Tomas', "Inez sent you? Then that thing probably works better than the equipment I’m paid to maintain."], ['You', "How many people are up there?"], ['Tomas', "Eleven. My daughter should be down here, but she went looking for a signal. Yellow coat. Answers to Mina, unless she’s decided she doesn’t."], ['You', "I can look."], ['Tomas', "First, the isolation switch on the station roof. Disconnect the flooded line before we plug anything in. Then come back. I have a wiring diagram and a very bad feeling."]) },
    { title: 'Make the line safe', hint: 'Climb the station ledges. Isolate the flooded feeder.', x: 1760, y: 302, kind: 'switch', chapter: 1,
      lines: lines(['You', "Feeder disconnected. The sparks stopped."], ['Tomas · radio', "Good. That buys us time. Come down to the cabinet; I’ll talk you through the wiring. Ignore the old labels. Someone painted over them before I started working here."]) },
    { title: 'Follow the circuit', hint: 'Return to Tomas and reconnect the cabinet.', x: 1450, y: 428, who: 'Tomas', kind: 'puzzle', chapter: 1,
      lines: lines(['Tomas', "The sequence is on the card: ground first, then the battery, then the line. Choose the matching symbols. You can reset it if you get it wrong; the breaker will protect us."], ['You', "That’s the first reassuring thing anyone has said all night."], ['Tomas', "Don’t get used to it."]) },
    { title: 'Someone at the far platform', hint: 'Find Mina beyond the maintenance platforms.', x: 2370, y: 428, who: 'Mina', kind: 'talk', chapter: 1,
      lines: lines(['Mina', "Dad sent you. I’m not lost. I know exactly where I am. I just don’t like the bit between here and there."], ['You', "Fair enough. We can walk it together."], ['Mina', "Is the tram coming down? He said he’d get everyone off, but he always says that before he knows how."], ['You', "We got the cabinet working. That’s a start."], ['Mina', "Okay. But don’t run off. People with radios always think everyone else can hear them."]) },
    { title: 'Walk her home', hint: 'Escort Mina back to Tomas. Stay close; she stops if you rush ahead.', x: 1450, y: 428, kind: 'escort', chapter: 1,
      lines: lines(['Tomas', "Mina. Oh, thank God."], ['Mina', "You can say you were worried. It’s allowed."], ['Tomas', "I was worried."], ['Mina', "See? Easy."], ['You', "The cabinet’s ready. What’s left?"], ['Tomas', "The tower. It controls the brake release, and the storm knocked both aerials out of alignment. The service lift will get you across. Take the radio; I’m staying with her."]) },
    { title: 'Above the street', hint: 'Find the tower keeper on the Skyline roof.', x: 2788, y: 345, who: 'Ada', kind: 'talk', chapter: 2,
      lines: lines(['Ada', "You’re the voice on the maintenance channel. Thought you’d be taller."], ['You', "Long night."], ['Ada', "It gets longer. This battery can power the brake release or the neighborhood transmitter. Both need a full charge."], ['You', "Tomas has people on that tram."], ['Ada', "And half the block is waiting for news. Align the two aerials first. We’ll have a connection either way. I won’t make the choice for you."]) },
    { title: 'Tune the west aerial', hint: 'Climb to the west aerial and match its circuit.', x: 3060, y: 292, kind: 'puzzle', chapter: 2,
      lines: lines(['Ada · radio', "The aerial has its own order: battery, line, ground. Follow the symbols on the card, then lock it in."], ['Mina · radio', "Can they hear us up there?"], ['You', "Not yet. Soon."]) },
    { title: 'Tune the east aerial', hint: 'Cross the moving platform and align the east aerial.', x: 3566, y: 298, kind: 'puzzle', chapter: 2,
      lines: lines(['Ada · radio', "Last aerial: line, ground, battery. The moving platform comes back around if you miss it. Don’t jump after it."], ['Inez · radio', "My sign’s gone dark. I’m choosing to believe that means you’re doing something useful."], ['You', "Working on it."]) },
    { title: 'What the light is for', hint: 'Return to Ada and choose where the battery goes.', x: 2788, y: 345, who: 'Ada', kind: 'choice', chapter: 2,
      lines: lines(['Ada', "Both aerials are aligned. One charge, two sockets. Brake control gets those eleven people down now. The transmitter lets the whole neighborhood call for help, but the tram waits for the rescue crew."], ['Tomas · radio', "You’ve done more than I could ask. Whatever you choose, I’m here. I won’t leave them."], ['Inez · radio', "It was a shop sign an hour ago. It’s your call now."], ['Mina · radio', "Just tell us what you’re going to do. Waiting’s worse when nobody tells you anything."]) },
    { title: 'One last connection', hint: 'Carry the battery to the uplink at the end of the roof.', x: 3760, y: 428, kind: 'ending', chapter: 2 },
  ];

  const people = [
    { name: 'Inez', x: 255, y: 428, coat: '#ce7656', skin: '#b57b5d', hair: '#e1d8bb', type: 'elder' },
    { name: 'Tomas', x: 1450, y: 428, coat: '#729b96', skin: '#8b5a43', hair: '#252b36', type: 'worker' },
    { name: 'Mina', x: 2370, y: 428, coat: '#edc363', skin: '#b78060', hair: '#32232b', type: 'child' },
    { name: 'Ada', x: 2788, y: 345, coat: '#9d88be', skin: '#d1a185', hair: '#3c293e', type: 'keeper' },
  ];

  class LastNight {
    constructor(api) {
      this.api = api;
      this.panel = document.getElementById('dialogue');
      this.objective = document.getElementById('objective');
      this.actions = document.getElementById('dialogueActions');
      this.step = 0; this.choice = ''; this.dialog = null; this.minaX = 2370;
      this.journal = []; this.finished = false; this.saved = null;
      try { const save = JSON.parse(localStorage.getItem('last-night-v1')); if (save?.version === 1 && Number.isInteger(save.step) && save.step >= 0 && save.step < steps.length) this.saved = save; } catch {}
      document.getElementById('continueButton').hidden = !this.saved;
      document.getElementById('continueButton').onclick = () => api.start(true);
      document.getElementById('interactButton').onclick = () => this.interact();
      this.refresh();
    }
    get current() { return steps[this.step]; }
    get locked() { return !!this.dialog; }
    get safeTransit() { return this.step > 4; }
    get escorting() { return this.step === 7; }
    reset(resume) {
      const s = resume ? this.saved : null;
      this.step = s?.step || 0; this.choice = s?.choice || ''; this.minaX = s?.minaX ?? 2370;
      this.journal = s?.journal || []; this.finished = false; this.dialog = null;
      this.panel.hidden = true; this.refresh();
      if (s) this.api.restore(s);
    }
    save() {
      const s = { version: 1, step: this.step, choice: this.choice, minaX: this.minaX, journal: this.journal, ...this.api.snapshot() };
      this.saved = s;
      try { localStorage.setItem('last-night-v1', JSON.stringify(s)); } catch {}
    }
    refresh() {
      const s = this.current;
      document.getElementById('objectiveChapter').textContent = `ACT ${s.chapter + 1} / ${['BORROWED LIGHT', 'THE LAST TRAM', 'A WAY HOME'][s.chapter]}`;
      document.getElementById('objectiveTitle').textContent = s.title;
      document.getElementById('objectiveHint').textContent = s.hint;
      document.getElementById('storyProgress').textContent = `${Math.min(this.step + 1, steps.length)} / ${steps.length}`;
    }
    advance() {
      this.journal.push(this.current.title);
      this.step = Math.min(this.step + 1, steps.length - 1);
      this.api.heal(); this.refresh(); this.save(); this.api.chime();
    }
    say(entries, after = () => this.advance()) {
      this.dialog = { entries, at: 0, after, mode: 'talk' };
      this.api.clearInput(); this.panel.hidden = false; this.renderLine();
    }
    renderLine() {
      const d = this.dialog, line = d.entries[d.at];
      document.getElementById('speaker').textContent = line.name;
      document.getElementById('dialogueText').textContent = line.text;
      document.getElementById('dialogueCount').textContent = `${d.at + 1} / ${d.entries.length}`;
      this.actions.replaceChildren();
      this.button(d.at === d.entries.length - 1 ? 'Continue →' : 'Next →', () => this.next());
      this.drawPortrait(line.name.split(' ·')[0]);
    }
    button(text, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.onclick = fn; this.actions.append(b); return b; }
    next() {
      const d = this.dialog;
      if (!d || d.mode !== 'talk') return;
      if (++d.at < d.entries.length) this.renderLine();
      else { this.dialog = null; this.panel.hidden = true; d.after(); }
    }
    interact() {
      if (!this.api.active() || this.finished) return;
      if (this.dialog) { this.next(); return; }
      const s = this.current, p = this.api.player;
      if (Math.abs(p.x - s.x) > 65 || Math.abs(p.y - s.y) > 24 || !p.grounded) return;
      if (s.kind === 'escort' && Math.abs(this.minaX - s.x) > 85) return;
      if (s.kind === 'puzzle') this.say(s.lines, () => this.puzzle());
      else if (s.kind === 'choice') this.say(s.lines, () => this.choose());
      else if (s.kind === 'ending') this.ending();
      else this.say(s.lines);
    }
    puzzle() {
      const sequence = this.step === 5 ? [0, 1, 2] : this.step === 9 ? [1, 2, 0] : [2, 0, 1];
      const names = ['⏚ GROUND', '▣ BATTERY', '↗ LINE'];
      this.dialog = { mode: 'puzzle', entered: [], sequence };
      this.panel.hidden = false;
      document.getElementById('speaker').textContent = 'SERVICE CIRCUIT';
      document.getElementById('dialogueCount').textContent = 'CONNECT IN ORDER';
      const render = (wrong = false) => {
        document.getElementById('dialogueText').textContent = `${wrong ? 'Breaker tripped. Safe to try again. ' : ''}Wiring card: ${sequence.map(i => names[i]).join(' → ')}. Connected: ${this.dialog.entered.length}/3.`;
        this.actions.replaceChildren();
        names.forEach((name, i) => this.button(name, () => {
          if (i !== sequence[this.dialog.entered.length]) { this.dialog.entered = []; render(true); return; }
          this.dialog.entered.push(i); this.api.chime();
          if (this.dialog.entered.length === 3) { this.dialog = null; this.panel.hidden = true; this.advance(); }
          else render();
        }));
      };
      render();
    }
    choose() {
      this.dialog = { mode: 'choice' }; this.panel.hidden = false;
      document.getElementById('speaker').textContent = 'YOUR CALL';
      document.getElementById('dialogueText').textContent = 'Release the tram now, or restore the neighborhood transmitter. Both choices have an ending; nobody dies because of your decision.';
      document.getElementById('dialogueCount').textContent = 'ONE BATTERY';
      this.actions.replaceChildren();
      [['tram', 'Get the tram home'], ['radio', 'Connect the neighborhood']].forEach(([value, label]) => this.button(label, () => {
        this.choice = value; this.dialog = null; this.panel.hidden = true; this.advance();
      }));
    }
    ending() {
      const entries = this.choice === 'tram' ? lines(
        ['Tomas · radio', "Brake pressure’s back. We’re moving. Eleven passengers, all coming down. Mina, step away from the edge."],
        ['Mina · radio', "I can see them. The windows are moving."],
        ['Inez · radio', "Someone just knocked on my door asking to borrow the phone. Told them it’s dead. They said they didn’t need a phone anymore; their husband’s on the tram."],
        ['Ada', "The transmitter can wait for daylight. You gave some people a shorter night."],
        ['You', "Tell Inez her battery’s empty."], ['Inez · radio', "Heard you. So is the kettle. Come home anyway."]
      ) : lines(
        ['Ada', "Carrier’s up. Listen."], ['Dispatch · radio', "Transit Ward, we have your position. Rescue crew is on the stairway. Keep passengers inside until they reach you."],
        ['Tomas · radio', "Copy that. Everyone’s staying put. Mina’s here with me."],
        ['Mina · radio', "The radio sounds crowded now."], ['Inez · radio', "That’s the neighborhood. I’d almost forgotten how much noise we make."],
        ['You', "The tram’s still waiting."], ['Ada', "Yes. But they know help is coming. So does everyone else."],
        ['Inez · radio', "Door’s open when you get back. Don’t bother knocking; I’ll hear those shoes."]
      );
      this.say(entries, () => {
        this.finished = true;
        try { localStorage.removeItem('last-night-v1'); } catch {}
        this.api.finish(this.choice);
      });
    }
    tick(dt) {
      if (!this.escorting || this.locked) return;
      const p = this.api.player, distance = p.x - this.minaX;
      if (Math.abs(distance) > 36 && Math.abs(distance) < 250) this.minaX += Math.sign(distance) * Math.min(Math.abs(distance) - 36, 64 * dt);
    }
    drawPortrait(name) {
      const c = document.getElementById('portrait'), ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height); ctx.imageSmoothingEnabled = false;
      const person = people.find(p => p.name === name) || people[3];
      ctx.save(); ctx.translate(40, 89); ctx.scale(.8, .8); this.person(ctx, { ...person, x: 0, y: 0 }, 0); ctx.restore();
    }
    person(ctx, p, time) {
      const child = p.type === 'child', scale = child ? 1.7 : 2.1;
      ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.scale(scale, scale);
      const f = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
      // Deliberately small, code-drawn pixel silhouettes; each cast member has distinct clothing and headwear.
      f('#111b2b', -6, -13, 5, 12); f('#111b2b', 2, -13, 5, 12);
      f('#c7c4b7', -7, -2, 7, 2); f('#c7c4b7', 2, -2, 7, 2);
      f(p.coat, -8, -30, 16, 18); f(p.coat, -11, -28, 4, 15); f(p.coat, 8, -28, 4, 15);
      f(p.skin, -11, -14, 4, 4); f(p.skin, 8, -14, 4, 4);
      f(p.skin, -5, -41, 11, 12); f(p.hair, -6, -43, 13, 5); f(p.hair, -6, -40, 3, 10);
      f('#192231', 3, -36, 2, 2); f('#f0d7b2', 3, -31, 3, 1);
      f('#283b4b', -1, -28, 2, 15);
      if (p.type === 'elder') { f(p.hair, -9, -42, 5, 7); f('#ecddc0', -4, -36, 11, 1); f('#ecddc0', -4, -36, 1, 3); }
      if (p.type === 'worker') { f('#e3b26c', -8, -44, 16, 4); f('#e3b26c', -5, -47, 11, 4); f('#e9d9ac', -8, -24, 16, 3); }
      if (p.type === 'child') { f('#f0c767', -7, -44, 14, 4); f('#f0c767', -9, -41, 3, 15); f('#c58056', 7, -24, 6, 11); }
      if (p.type === 'keeper') { f('#e1cadf', -8, -31, 17, 4); f(p.hair, -7, -40, 3, 17); }
      ctx.restore();
    }
    draw(ctx, time) {
      for (const p of people) {
        let x = p.x;
        if (p.name === 'Mina') x = this.step > 7 ? 1500 : this.minaX;
        this.person(ctx, { ...p, x }, time);
        ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#f2dec0'; ctx.fillText(p.name, x, p.y - (p.type === 'child' ? 88 : 105));
      }
      const s = this.current;
      if (!s.who && s.kind !== 'escort') {
        ctx.fillStyle = '#112d3b'; ctx.fillRect(s.x - 15, s.y - 34, 30, 34);
        ctx.fillStyle = '#e5c381'; ctx.fillRect(s.x - 12, s.y - 32, 24, 3);
        ctx.fillStyle = '#73e0cb'; ctx.fillRect(s.x - 8, s.y - 23, 16, 12);
      }
      ctx.textAlign = 'center'; ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffe2a0'; ctx.fillText('▼', s.x, s.y - 117 + Math.sin(time * 3) * 3);
      const near = Math.abs(this.api.player.x - s.x) < 65 && Math.abs(this.api.player.y - s.y) < 24;
      if (near && !this.locked) { ctx.fillStyle = '#091521'; ctx.fillRect(s.x - 48, s.y - 146, 96, 22); ctx.fillStyle = '#ffe2a0'; ctx.fillText('[E] INTERACT', s.x, s.y - 131); }
      ctx.textAlign = 'start';
    }
  }
  window.LastNight = LastNight;
})();
