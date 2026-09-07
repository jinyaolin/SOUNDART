// 範例 patch。前四個移植自 zaistudio.tw/labs/sound，其餘是為 SOUNDART 各章節做的教學範例。
const seq = (semis) => semis.map(s => ({ on: s !== null, semi: s ?? 0 }));

export const PRESETS = [
  // ── 原版範例 ──────────────────────────────────────────────
  { id: 'bass', name: '🎛 鋸齒貝斯（seq 驅動）', patch: {
    name: '鋸齒貝斯',
    nodes: [
      { id: 'seq1', type: 'seq', x: 30, y: 30, params: { bpm: 132 }, opts: {}, steps: seq([0,null,0,null,3,null,0,null,7,null,5,null,3,null,2,null]) },
      { id: 'osc1', type: 'osc', x: 250, y: 40, params: { freq: 0, detune: 0 }, opts: { type: 'sawtooth' } },
      { id: 'flt1', type: 'filter', x: 480, y: 60, params: { freq: 900, q: 4 }, opts: { type: 'lowpass' } },
      { id: 'lfo1', type: 'lfo', x: 260, y: 260, params: { rate: 0.4, depth: 700 }, opts: { type: 'sine' } },
      { id: 'adsr1', type: 'adsr', x: 700, y: 50, params: { a: 0.005, d: 0.1, s: 0.5, r: 0.12 }, opts: {} },
      { id: 'dly1', type: 'delay', x: 920, y: 60, params: { time: 0.22, fb: 0.3, mix: 0.25 }, opts: {} },
      { id: 'out1', type: 'out', x: 1140, y: 70, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'seq1', fp:'freq', t:'osc1', tp:'fm' }, { f:'seq1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'osc1', fp:'out', t:'flt1', tp:'in' }, { f:'lfo1', fp:'cv', t:'flt1', tp:'fm' },
      { f:'flt1', fp:'out', t:'adsr1', tp:'in' }, { f:'adsr1', fp:'out', t:'dly1', tp:'in' },
      { f:'dly1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'siren', name: '👽 外星警報', patch: {
    name: '外星警報',
    nodes: [
      { id: 'lfo1', type: 'lfo', x: 40, y: 40, params: { rate: 0.3, depth: 300 }, opts: { type: 'sine' } },
      { id: 'lfo2', type: 'lfo', x: 40, y: 250, params: { rate: 6, depth: 8 }, opts: { type: 'sine' } },
      { id: 'osc1', type: 'osc', x: 300, y: 60, params: { freq: 400, detune: 0 }, opts: { type: 'sine' } },
      { id: 'vca1', type: 'vca', x: 540, y: 70, params: { gain: 0.5 }, opts: {} },
      { id: 'dly1', type: 'delay', x: 760, y: 70, params: { time: 0.35, fb: 0.55, mix: 0.45 }, opts: {} },
      { id: 'out1', type: 'out', x: 1000, y: 80, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'lfo1', fp:'cv', t:'osc1', tp:'fm' }, { f:'lfo2', fp:'cv', t:'osc1', tp:'fm' },
      { f:'osc1', fp:'out', t:'vca1', tp:'in' }, { f:'vca1', fp:'out', t:'dly1', tp:'in' },
      { f:'dly1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'chiptune', name: '🕹 晶片琶音（也可鍵盤彈）', patch: {
    name: '晶片琶音',
    nodes: [
      { id: 'seq1', type: 'seq', x: 30, y: 30, params: { bpm: 175 }, opts: {}, steps: seq([0,7,12,16,19,16,12,7,0,7,12,16,21,19,16,12]) },
      { id: 'kbd1', type: 'keyboard', x: 30, y: 260, params: { octave: 0, glide: 0.03 }, opts: {} },
      { id: 'osc1', type: 'osc', x: 280, y: 80, params: { freq: 0, detune: 0 }, opts: { type: 'square' } },
      { id: 'adsr1', type: 'adsr', x: 510, y: 70, params: { a: 0.004, d: 0.06, s: 0.35, r: 0.09 }, opts: {} },
      { id: 'dly1', type: 'delay', x: 740, y: 70, params: { time: 0.17, fb: 0.4, mix: 0.35 }, opts: {} },
      { id: 'out1', type: 'out', x: 980, y: 80, params: { vol: 0.55 }, opts: {} },
    ],
    cables: [
      { f:'seq1', fp:'freq', t:'osc1', tp:'fm' }, { f:'seq1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'kbd1', fp:'freq', t:'osc1', tp:'fm' }, { f:'kbd1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'osc1', fp:'out', t:'adsr1', tp:'in' }, { f:'adsr1', fp:'out', t:'dly1', tp:'in' },
      { f:'dly1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'wind', name: '🌬 風吹過山谷', patch: {
    name: '風吹過山谷',
    nodes: [
      { id: 'noise1', type: 'noise', x: 40, y: 60, params: { rate: 0.5 }, opts: {} },
      { id: 'flt1', type: 'filter', x: 300, y: 60, params: { freq: 600, q: 8 }, opts: { type: 'bandpass' } },
      { id: 'lfo1', type: 'lfo', x: 40, y: 260, params: { rate: 0.08, depth: 450 }, opts: { type: 'sine' } },
      { id: 'lfo2', type: 'lfo', x: 300, y: 280, params: { rate: 0.23, depth: 200 }, opts: { type: 'sine' } },
      { id: 'vca1', type: 'vca', x: 560, y: 70, params: { gain: 0.7 }, opts: {} },
      { id: 'dly1', type: 'delay', x: 780, y: 70, params: { time: 0.5, fb: 0.5, mix: 0.4 }, opts: {} },
      { id: 'out1', type: 'out', x: 1020, y: 80, params: { vol: 0.65 }, opts: {} },
    ],
    cables: [
      { f:'noise1', fp:'out', t:'flt1', tp:'in' }, { f:'lfo1', fp:'cv', t:'flt1', tp:'fm' },
      { f:'lfo2', fp:'cv', t:'flt1', tp:'fm' }, { f:'flt1', fp:'out', t:'vca1', tp:'in' },
      { f:'vca1', fp:'out', t:'dly1', tp:'in' }, { f:'dly1', fp:'out', t:'out1', tp:'in' },
    ] } },

  // ── SOUNDART 教材專用 ─────────────────────────────────────
  { id: 'ch3-vcovcfvca', ch: '第 3 章 3.4', name: '🎹 VCO → VCF → VCA（1964 年的標準版型）', patch: {
    name: 'VCO → VCF → VCA',
    nodes: [
      { id: 'seq1', type: 'seq', x: 30, y: 20, params: { bpm: 92 }, opts: {}, steps: seq([0,null,null,null,0,null,null,null,0,null,null,null,0,null,null,null]) },
      { id: 'kbd1', type: 'keyboard', x: 30, y: 280, params: { octave: 0, glide: 0.02 }, opts: {} },
      { id: 'osc1', type: 'osc', x: 300, y: 60, params: { freq: 0, detune: 0 }, opts: { type: 'sawtooth' } },
      { id: 'flt1', type: 'filter', x: 550, y: 70, params: { freq: 1200, q: 6 }, opts: { type: 'lowpass' } },
      { id: 'adsr1', type: 'adsr', x: 800, y: 80, params: { a: 0.01, d: 0.2, s: 0.5, r: 0.35 }, opts: {} },
      { id: 'out1', type: 'out', x: 1040, y: 90, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'seq1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'kbd1', fp:'freq', t:'osc1', tp:'fm' }, { f:'kbd1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'osc1', fp:'out', t:'flt1', tp:'in' }, { f:'flt1', fp:'out', t:'adsr1', tp:'in' },
      { f:'adsr1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-sub-lfo', ch: '第 7 章 7.4', name: '🎚 減法合成：LFO 掃濾波器', patch: {
    name: '減法合成 + LFO 掃頻',
    nodes: [
      { id: 'osc1', type: 'osc', x: 40, y: 50, params: { freq: 110, detune: 0 }, opts: { type: 'sawtooth' } },
      { id: 'flt1', type: 'filter', x: 330, y: 60, params: { freq: 700, q: 8 }, opts: { type: 'lowpass' } },
      { id: 'lfo1', type: 'lfo', x: 40, y: 280, params: { rate: 0.35, depth: 600 }, opts: { type: 'sine' } },
      { id: 'vca1', type: 'vca', x: 600, y: 70, params: { gain: 0.5 }, opts: {} },
      { id: 'out1', type: 'out', x: 840, y: 80, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'osc1', fp:'out', t:'flt1', tp:'in' }, { f:'lfo1', fp:'cv', t:'flt1', tp:'fm' },
      { f:'flt1', fp:'out', t:'vca1', tp:'in' }, { f:'vca1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-additive', ch: '第 7 章 7.3', name: '➕ 加法合成：四個泛音疊出鋸齒', patch: {
    name: '加法合成',
    nodes: [
      { id: 'o1', type: 'osc', x: 40, y: 20, params: { freq: 220, detune: 0 }, opts: { type: 'sine' } },
      { id: 'o2', type: 'osc', x: 40, y: 160, params: { freq: 440, detune: 0 }, opts: { type: 'sine' } },
      { id: 'o3', type: 'osc', x: 40, y: 300, params: { freq: 660, detune: 0 }, opts: { type: 'sine' } },
      { id: 'o4', type: 'osc', x: 40, y: 440, params: { freq: 880, detune: 0 }, opts: { type: 'sine' } },
      { id: 'g1', type: 'vca', x: 330, y: 30, params: { gain: 0.5 }, opts: {} },
      { id: 'g2', type: 'vca', x: 330, y: 170, params: { gain: 0.25 }, opts: {} },
      { id: 'g3', type: 'vca', x: 330, y: 310, params: { gain: 0.16 }, opts: {} },
      { id: 'g4', type: 'vca', x: 330, y: 450, params: { gain: 0.12 }, opts: {} },
      { id: 'out1', type: 'out', x: 620, y: 230, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'o1', fp:'out', t:'g1', tp:'in' }, { f:'o2', fp:'out', t:'g2', tp:'in' },
      { f:'o3', fp:'out', t:'g3', tp:'in' }, { f:'o4', fp:'out', t:'g4', tp:'in' },
      { f:'g1', fp:'out', t:'out1', tp:'in' }, { f:'g2', fp:'out', t:'out1', tp:'in' },
      { f:'g3', fp:'out', t:'out1', tp:'in' }, { f:'g4', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-ringmod', ch: '第 7 章 7.5', name: '🔔 環形調變：兩個訊號相乘', patch: {
    name: '環形調變',
    nodes: [
      { id: 'car', type: 'osc', x: 40, y: 40, params: { freq: 440, detune: 0 }, opts: { type: 'sine' } },
      { id: 'mod', type: 'osc', x: 40, y: 260, params: { freq: 137, detune: 0 }, opts: { type: 'sine' } },
      { id: 'vca1', type: 'vca', x: 380, y: 90, params: { gain: 0 }, opts: {} },
      { id: 'out1', type: 'out', x: 660, y: 100, params: { vol: 0.5 }, opts: {} },
    ],
    cables: [
      { f:'car', fp:'out', t:'vca1', tp:'in' }, { f:'mod', fp:'out', t:'vca1', tp:'cv' },
      { f:'vca1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-adsr', ch: '第 7 章 7.6', name: '📈 ADSR：把 Attack 調到 0 聽 click', patch: {
    name: 'ADSR 包絡',
    nodes: [
      { id: 'seq1', type: 'seq', x: 30, y: 30, params: { bpm: 96 }, opts: {}, steps: seq([0,null,null,null,0,null,null,null,0,null,null,null,0,null,null,null]) },
      { id: 'osc1', type: 'osc', x: 290, y: 50, params: { freq: 440, detune: 0 }, opts: { type: 'sine' } },
      { id: 'adsr1', type: 'adsr', x: 540, y: 60, params: { a: 0.003, d: 0.15, s: 0.4, r: 0.3 }, opts: {} },
      { id: 'out1', type: 'out', x: 800, y: 70, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'seq1', fp:'freq', t:'osc1', tp:'fm' }, { f:'seq1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'osc1', fp:'out', t:'adsr1', tp:'in' }, { f:'adsr1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-delay', ch: '第 7 章 7.8', name: '🔁 延遲家族：從梳狀濾波到回聲', patch: {
    name: '延遲家族',
    nodes: [
      { id: 'seq1', type: 'seq', x: 30, y: 30, params: { bpm: 96 }, opts: {}, steps: seq([0,null,null,null,7,null,null,null,0,null,null,null,5,null,null,null]) },
      { id: 'osc1', type: 'osc', x: 280, y: 50, params: { freq: 330, detune: 0 }, opts: { type: 'triangle' } },
      { id: 'adsr1', type: 'adsr', x: 520, y: 60, params: { a: 0.004, d: 0.12, s: 0.25, r: 0.12 }, opts: {} },
      { id: 'dly1', type: 'delay', x: 760, y: 70, params: { time: 0.004, fb: 0.75, mix: 0.5 }, opts: {} },
      { id: 'out1', type: 'out', x: 1010, y: 80, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'seq1', fp:'freq', t:'osc1', tp:'fm' }, { f:'seq1', fp:'gate', t:'adsr1', tp:'gate' },
      { f:'osc1', fp:'out', t:'adsr1', tp:'in' }, { f:'adsr1', fp:'out', t:'dly1', tp:'in' },
      { f:'dly1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-fm', ch: '第 7 章 7.5', name: '🎺 FM 合成：調變器 → 深度 → 載波', patch: {
    name: 'FM 合成',
    nodes: [
      { id: 'mod', type: 'osc', x: 40, y: 60, params: { freq: 220, detune: 0 }, opts: { type: 'sine' } },
      { id: 'amp1', type: 'amp', x: 320, y: 70, params: { depth: 600, offset: 0 }, opts: {} },
      { id: 'car', type: 'osc', x: 620, y: 60, params: { freq: 220, detune: 0 }, opts: { type: 'sine' } },
      { id: 'vca1', type: 'vca', x: 900, y: 70, params: { gain: 0.35 }, opts: {} },
      { id: 'out1', type: 'out', x: 1140, y: 80, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'mod', fp:'out', t:'amp1', tp:'in' }, { f:'amp1', fp:'out', t:'car', tp:'fm' },
      { f:'car', fp:'out', t:'vca1', tp:'in' }, { f:'vca1', fp:'out', t:'out1', tp:'in' },
    ] } },

  { id: 'ch7-fm-env', ch: '第 7 章 7.5', name: '🎹 FM：讓 Index 隨時間衰減（DX7 的祕密）', patch: {
    name: 'FM + Index 包絡',
    nodes: [
      { id: 'seq1', type: 'seq', x: 20, y: 20, params: { bpm: 84 }, opts: {}, steps: seq([0,null,null,null,0,null,null,null,0,null,null,null,0,null,null,null]) },
      { id: 'mod', type: 'osc', x: 20, y: 250, params: { freq: 220, detune: 0 }, opts: { type: 'sine' } },
      { id: 'eidx', type: 'adsr', x: 270, y: 20, params: { a: 0.002, d: 0.35, s: 0, r: 0.2 }, opts: {} },
      { id: 'aenv', type: 'amp', x: 520, y: 20, params: { depth: 1400, offset: 0 }, opts: {} },
      { id: 'aidx', type: 'amp', x: 300, y: 260, params: { depth: 0, offset: 0 }, opts: {} },
      { id: 'car', type: 'osc', x: 600, y: 250, params: { freq: 220, detune: 0 }, opts: { type: 'sine' } },
      { id: 'aout', type: 'adsr', x: 850, y: 250, params: { a: 0.004, d: 0.5, s: 0.15, r: 0.3 }, opts: {} },
      { id: 'out1', type: 'out', x: 1100, y: 260, params: { vol: 0.6 }, opts: {} },
    ],
    cables: [
      { f:'seq1', fp:'gate', t:'eidx', tp:'gate' }, { f:'seq1', fp:'gate', t:'aout', tp:'gate' },
      { f:'eidx', fp:'env', t:'aenv', tp:'in' }, { f:'aenv', fp:'out', t:'aidx', tp:'dep' },
      { f:'mod', fp:'out', t:'aidx', tp:'in' }, { f:'aidx', fp:'out', t:'car', tp:'fm' },
      { f:'car', fp:'out', t:'aout', tp:'in' }, { f:'aout', fp:'out', t:'out1', tp:'in' },
    ] } },
];
