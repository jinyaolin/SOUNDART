// 聲音實驗室 — 節點圖音訊引擎（純 Web Audio API，無依賴）
// 移植自 zaistudio.tw/labs/sound 的 engine.ts，邏輯相同、去掉 TypeScript 型別。
// patch(JSON) → AudioNode 圖；三種埠：audio（音訊）、cv（控制訊號，接 AudioParam）、gate（事件，觸發 ADSR）

export const midi2freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const NODE_DEFS = {
  osc: {
    label: 'osc~ 振盪器',
    hint: '產生波形。頻率吃 cv，所以可以被 LFO、鍵盤、音序器控制。',
    inputs: [{ id: 'fm', label: 'fm', kind: 'cv' }],
    outputs: [{ id: 'out', label: 'out', kind: 'audio' }],
    params: [
      { id: 'freq', label: '頻率', min: 20, max: 2000, def: 110, log: true, unit: 'Hz' },
      { id: 'detune', label: '失諧', min: -100, max: 100, def: 0, step: 1, unit: '¢' },
    ],
    options: [{ id: 'type', label: '波形', def: 'sawtooth', choices: [
      { v: 'sine', label: 'sin' }, { v: 'triangle', label: 'tri' },
      { v: 'sawtooth', label: 'saw' }, { v: 'square', label: 'sqr' }] }],
    create(ctx, node) {
      const o = ctx.createOscillator();
      o.type = node.opts.type || 'sawtooth';
      o.frequency.value = node.params.freq ?? 110;
      o.detune.value = node.params.detune ?? 0;
      o.start();
      return {
        ins: {}, targets: { fm: o.frequency }, outs: { out: o },
        setParam: (id, v) => { if (id === 'freq') o.frequency.value = v; else o.detune.value = v; },
        setOpt: (id, v) => { if (id === 'type') o.type = v; },
        dispose: () => { try { o.stop(); } catch {} o.disconnect(); },
      };
    },
  },

  noise: {
    label: 'noise~ 噪音',
    hint: '白噪音。所有頻率都有，是風、海浪、打擊樂的起點。',
    inputs: [],
    outputs: [{ id: 'out', label: 'out', kind: 'audio' }],
    params: [{ id: 'rate', label: '速率', min: 0.25, max: 4, def: 1, log: true, unit: '×' }],
    options: [],
    create(ctx, node) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      src.playbackRate.value = node.params.rate ?? 1;
      src.start();
      return {
        ins: {}, targets: {}, outs: { out: src },
        setParam: (_id, v) => { src.playbackRate.value = v; },
        dispose: () => { try { src.stop(); } catch {} src.disconnect(); },
      };
    },
  },

  filter: {
    label: 'filter~ 濾波器',
    hint: '削掉某些頻率。截止頻率吃 cv，接一個 LFO 上去就是自動掃頻。',
    inputs: [{ id: 'in', label: 'in', kind: 'audio' }, { id: 'fm', label: 'fm', kind: 'cv' }],
    outputs: [{ id: 'out', label: 'out', kind: 'audio' }],
    params: [
      { id: 'freq', label: '截止', min: 20, max: 12000, def: 1200, log: true, unit: 'Hz' },
      { id: 'q', label: 'Q', min: 0.1, max: 20, def: 1, log: true },
    ],
    options: [{ id: 'type', label: '類型', def: 'lowpass', choices: [
      { v: 'lowpass', label: 'LP' }, { v: 'highpass', label: 'HP' },
      { v: 'bandpass', label: 'BP' }, { v: 'notch', label: 'Notch' }] }],
    create(ctx, node) {
      const f = ctx.createBiquadFilter();
      f.type = node.opts.type || 'lowpass';
      f.frequency.value = node.params.freq ?? 1200;
      f.Q.value = node.params.q ?? 1;
      return {
        ins: { in: f }, targets: { fm: f.frequency }, outs: { out: f },
        setParam: (id, v) => { if (id === 'freq') f.frequency.value = v; else f.Q.value = v; },
        setOpt: (id, v) => { if (id === 'type') f.type = v; },
        dispose: () => f.disconnect(),
      };
    },
  },

  vca: {
    label: '*~ 增益',
    hint: '音量。增益吃 cv，所以可以被包絡或 LFO 控制。',
    inputs: [{ id: 'in', label: 'in', kind: 'audio' }, { id: 'cv', label: 'cv', kind: 'cv' }],
    outputs: [{ id: 'out', label: 'out', kind: 'audio' }],
    params: [{ id: 'gain', label: '增益', min: 0, max: 1, def: 0.5, step: 0.01 }],
    options: [],
    create(ctx, node) {
      const g = ctx.createGain();
      g.gain.value = node.params.gain ?? 0.5;
      return {
        ins: { in: g }, targets: { cv: g.gain }, outs: { out: g },
        setParam: (_id, v) => { g.gain.value = v; },
        dispose: () => g.disconnect(),
      };
    },
  },

  adsr: {
    label: 'adsr~ 包絡',
    hint: 'Attack 設 0 會聽到「喀」。給它 2～5 毫秒就消失。',
    inputs: [{ id: 'gate', label: 'gate', kind: 'gate' }, { id: 'in', label: 'in', kind: 'audio' }],
    outputs: [{ id: 'out', label: 'out', kind: 'audio' }],
    params: [
      { id: 'a', label: 'A', min: 0.001, max: 2, def: 0.01, log: true, unit: 's' },
      { id: 'd', label: 'D', min: 0.001, max: 2, def: 0.08, log: true, unit: 's' },
      { id: 's', label: 'S', min: 0, max: 1, def: 0.6, step: 0.01 },
      { id: 'r', label: 'R', min: 0.001, max: 3, def: 0.2, log: true, unit: 's' },
    ],
    options: [],
    create(ctx, node) {
      const g = ctx.createGain();
      g.gain.value = 0;
      const P = () => ({ a: node.params.a ?? 0.01, d: node.params.d ?? 0.08, s: node.params.s ?? 0.6, r: node.params.r ?? 0.2 });
      const onGate = (on, when) => {
        const p = g.gain, { a, d, s, r } = P();
        p.cancelScheduledValues(when);
        if (on) {
          p.setValueAtTime(Math.max(p.value, 0.0001), when);
          p.linearRampToValueAtTime(1, when + a);
          p.linearRampToValueAtTime(Math.max(s, 0.0001), when + a + d);
        } else {
          p.setValueAtTime(p.value, when);
          p.linearRampToValueAtTime(0, when + r);
        }
      };
      return {
        ins: { in: g }, targets: {}, outs: { out: g }, onGate,
        setParam: (id, v) => { node.params[id] = v; },
        dispose: () => g.disconnect(),
      };
    },
  },

  lfo: {
    label: 'lfo~ 低頻振盪',
    hint: '頻率低到聽不見，不拿來發聲，拿來控制別的參數。',
    inputs: [],
    outputs: [{ id: 'cv', label: 'cv', kind: 'cv' }],
    params: [
      { id: 'rate', label: '速率', min: 0.01, max: 20, def: 2, log: true, unit: 'Hz' },
      { id: 'depth', label: '深度', min: 0, max: 1000, def: 200, log: true },
    ],
    options: [{ id: 'type', label: '波形', def: 'sine', choices: [
      { v: 'sine', label: 'sin' }, { v: 'triangle', label: 'tri' },
      { v: 'sawtooth', label: 'saw' }, { v: 'square', label: 'sqr' }] }],
    create(ctx, node) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = node.opts.type || 'sine';
      o.frequency.value = node.params.rate ?? 2;
      g.gain.value = node.params.depth ?? 200;
      o.connect(g); o.start();
      return {
        ins: {}, targets: {}, outs: { cv: g },
        setParam: (id, v) => { if (id === 'rate') o.frequency.value = v; else g.gain.value = v; },
        setOpt: (id, v) => { if (id === 'type') o.type = v; },
        dispose: () => { try { o.stop(); } catch {} o.disconnect(); g.disconnect(); },
      };
    },
  },

  delay: {
    label: 'delay~ 延遲',
    hint: '1–10ms 是梳狀濾波，20–40ms 是合唱，100ms 以上才聽得出是回聲。回授要小於 1。',
    inputs: [{ id: 'in', label: 'in', kind: 'audio' }],
    outputs: [{ id: 'out', label: 'out', kind: 'audio' }],
    params: [
      { id: 'time', label: '時間', min: 0, max: 1.5, def: 0.3, step: 0.01, unit: 's' },
      { id: 'fb', label: '回授', min: 0, max: 0.95, def: 0.35, step: 0.01 },
      { id: 'mix', label: '混合', min: 0, max: 1, def: 0.3, step: 0.01 },
    ],
    options: [],
    create(ctx, node) {
      const d = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain(), dry = ctx.createGain(), out = ctx.createGain();
      const inNode = ctx.createGain();
      d.delayTime.value = node.params.time ?? 0.3;
      fb.gain.value = node.params.fb ?? 0.35;
      wet.gain.value = node.params.mix ?? 0.3;
      dry.gain.value = 1 - (node.params.mix ?? 0.3);
      inNode.connect(d); d.connect(wet); wet.connect(out);
      inNode.connect(dry); dry.connect(out);
      d.connect(fb); fb.connect(d);
      return {
        ins: { in: inNode }, targets: {}, outs: { out },
        setParam: (id, v) => {
          if (id === 'time') d.delayTime.value = v;
          else if (id === 'fb') fb.gain.value = v;
          else { wet.gain.value = v; dry.gain.value = 1 - v; }
        },
        dispose: () => { for (const n of [inNode, d, fb, wet, dry, out]) n.disconnect(); },
      };
    },
  },

  keyboard: {
    label: 'kbd 鍵盤',
    hint: '用電腦鍵盤 a w s e d f t g y h u j 彈。freq 接振盪器、gate 接包絡。',
    inputs: [],
    outputs: [{ id: 'freq', label: 'freq', kind: 'cv' }, { id: 'gate', label: 'gate', kind: 'gate' }],
    params: [
      { id: 'octave', label: '八度', min: -2, max: 2, def: 0, step: 1 },
      { id: 'glide', label: '滑音', min: 0, max: 0.5, def: 0.02, step: 0.005, unit: 's' },
    ],
    options: [],
    create(ctx, node, emitGate) {
      const cs = ctx.createConstantSource();
      cs.offset.value = midi2freq(60);
      cs.start();
      const held = new Set();
      const noteOn = (midi) => {
        held.add(midi);
        const m = midi + (node.params.octave ?? 0) * 12;
        cs.offset.setTargetAtTime(midi2freq(m), ctx.currentTime, Math.max(node.params.glide ?? 0.02, 0.001));
        emitGate(true);
      };
      const noteOff = (midi) => {
        held.delete(midi);
        if (held.size === 0) emitGate(false);
        else {
          const last = [...held].pop();
          cs.offset.setTargetAtTime(midi2freq(last + (node.params.octave ?? 0) * 12), ctx.currentTime, Math.max(node.params.glide ?? 0.02, 0.001));
        }
      };
      return {
        ins: {}, targets: {}, outs: { freq: cs },
        api: { noteOn, noteOff },
        setParam: (id, v) => { node.params[id] = v; },
        dispose: () => { try { cs.stop(); } catch {} cs.disconnect(); },
      };
    },
  },

  seq: {
    label: 'seq 音序器',
    hint: '16 步循環。freq 接振盪器、gate 接包絡，就會自己跑。',
    inputs: [],
    outputs: [{ id: 'freq', label: 'freq', kind: 'cv' }, { id: 'gate', label: 'gate', kind: 'gate' }],
    params: [{ id: 'bpm', label: 'BPM', min: 40, max: 240, def: 120, step: 1 }],
    options: [],
    create(ctx, node, emitGate) {
      const cs = ctx.createConstantSource();
      cs.offset.value = midi2freq(60);
      cs.start();
      let steps = node.steps || [];
      let step = 0, nextT = ctx.currentTime + 0.1;
      const tick = () => {
        const bpm = node.params.bpm ?? 120;
        const dur = 60 / bpm / 2;   // 8 分音符
        while (nextT < ctx.currentTime + 0.12) {
          const st = steps[step];
          if (st && st.on) {
            cs.offset.setValueAtTime(midi2freq(60 + st.semi), nextT);
            const delay = Math.max(0, (nextT - ctx.currentTime) * 1000);
            setTimeout(() => emitGate(true), delay);
            setTimeout(() => emitGate(false), delay + dur * 900);
          }
          step = (step + 1) % 16;
          nextT += dur;
        }
      };
      const timer = setInterval(tick, 30);
      return {
        ins: {}, targets: {}, outs: { freq: cs },
        api: { setSteps: (s) => { steps = s; } },
        setParam: (id, v) => { node.params[id] = v; },
        dispose: () => { clearInterval(timer); try { cs.stop(); } catch {} cs.disconnect(); },
      };
    },
  },

  out: {
    label: 'out~ 輸出',
    hint: '接到喇叭。沒有這個節點就不會有聲音。',
    inputs: [{ id: 'in', label: 'in', kind: 'audio' }],
    outputs: [],
    params: [{ id: 'vol', label: '音量', min: 0, max: 1, def: 0.7, step: 0.01 }],
    options: [],
    create(ctx, node) {
      const g = ctx.createGain();
      g.gain.value = node.params.vol ?? 0.7;
      return {
        ins: { in: g }, targets: {}, outs: { out: g },
        setParam: (_id, v) => { g.gain.value = v; },
        dispose: () => g.disconnect(),
      };
    },
  },
};

export class PatchEngine {
  constructor() {
    this.ctx = null; this.master = null; this.analyser = null;
    this.runtimes = new Map();
    this.gateSubs = new Map();
  }
  ensureCtx() {
    if (this.ctx) return this.ctx;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.85;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    return ctx;
  }
  resume() { this.ensureCtx(); if (this.ctx.state !== 'running') this.ctx.resume(); }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  get running() { return this.ctx && this.ctx.state === 'running'; }

  buildPatch(patch) {
    if (!this.ctx) return;
    this.teardown();
    const ctx = this.ctx;
    for (const n of patch.nodes) {
      const def = NODE_DEFS[n.type];
      if (!def) continue;
      const emitGate = (on, when) => {
        const t = when ?? ctx.currentTime;
        const subs = this.gateSubs.get(n.id);
        if (subs) subs.forEach(fn => { try { fn(on, t); } catch {} });
      };
      this.runtimes.set(n.id, def.create(ctx, n, emitGate));
    }
    for (const c of patch.cables) {
      const src = this.runtimes.get(c.f), dst = this.runtimes.get(c.t);
      if (!src || !dst) continue;
      const srcNode = patch.nodes.find(n => n.id === c.f);
      if (!srcNode) continue;
      const srcDef = NODE_DEFS[srcNode.type];
      const port = srcDef && srcDef.outputs.find(p => p.id === c.fp);
      if (!port) continue;
      if (port.kind === 'gate') {
        if (dst.onGate) {
          if (!this.gateSubs.has(c.f)) this.gateSubs.set(c.f, new Set());
          this.gateSubs.get(c.f).add(dst.onGate);
        }
        continue;
      }
      const outNode = src.outs[c.fp];
      if (!outNode) continue;
      const param = dst.targets[c.tp];
      const audioIn = dst.ins[c.tp];
      try {
        if (param) outNode.connect(param);
        else if (audioIn) outNode.connect(audioIn);
      } catch {}
    }
    for (const n of patch.nodes) {
      if (n.type === 'out') {
        const rt = this.runtimes.get(n.id);
        if (rt && rt.outs.out) rt.outs.out.connect(this.master);
      }
    }
  }
  teardown() {
    for (const rt of this.runtimes.values()) { try { rt.dispose(); } catch {} }
    this.runtimes.clear();
    this.gateSubs.clear();
  }
  setParam(nodeId, paramId, v) { const rt = this.runtimes.get(nodeId); if (rt && rt.setParam) rt.setParam(paramId, v); }
  setOpt(nodeId, optId, v) { const rt = this.runtimes.get(nodeId); if (rt && rt.setOpt) rt.setOpt(optId, v); }
  api(nodeId, fn, ...args) { const rt = this.runtimes.get(nodeId); if (rt && rt.api && rt.api[fn]) rt.api[fn](...args); }
  dispose() { this.teardown(); if (this.ctx) this.ctx.close().catch(() => {}); this.ctx = null; }
}

export function emptyPatch() { return { name: '未命名 patch', nodes: [], cables: [] }; }

// 與 zaistudio.tw/labs/sound 相同的格式，兩邊的分享連結互通
export function patchToHash(p) {
  return '#p=' + btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}
export function patchFromHash(hash) {
  try {
    if (!hash.startsWith('#p=')) return null;
    const p = JSON.parse(decodeURIComponent(escape(atob(hash.slice(3)))));
    if (!p || !Array.isArray(p.nodes) || !Array.isArray(p.cables)) return null;
    return p;
  } catch { return null; }
}
export function defaultParams(type) {
  const out = {}; const def = NODE_DEFS[type];
  for (const p of (def ? def.params : [])) out[p.id] = p.def;
  return out;
}
export function defaultOpts(type) {
  const out = {}; const def = NODE_DEFS[type];
  for (const o of (def ? def.options : [])) out[o.id] = o.def;
  return out;
}
