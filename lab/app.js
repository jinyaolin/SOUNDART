import { PatchEngine, NODE_DEFS, emptyPatch, patchToHash, patchFromHash,
         defaultParams, defaultOpts, clamp } from './engine.js';
import { PRESETS } from './presets.js';

const LS_KEY = 'soundart.lab.patch.v1';
const KIND_COLOR = { audio: '#e8dcc3', cv: '#e0a94e', gate: '#7fd18a' };
const PALETTE = ['osc','noise','filter','vca','adsr','lfo','delay','keyboard','seq','out'];
const KEYMAP = { a:60,w:61,s:62,e:63,d:64,f:65,t:66,g:67,y:68,h:69,u:70,j:71,k:72,o:73,l:74,p:75,';':76 };

let uidN = 1;
const uid = () => 'n' + (uidN++) + Math.random().toString(36).slice(2, 5);
const $ = (s, r = document) => r.querySelector(s);

// 滑桿數值↔位置（log 或 cubic）
const toRatio = (v, min, max, log) => log ? (min > 0 ? (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min)) : Math.cbrt(v / max)) : (v - min) / (max - min);
const fromRatio = (x, min, max, log) => log ? (min > 0 ? Math.exp(Math.log(min) + x * (Math.log(max) - Math.log(min))) : max * x * x * x) : min + x * (max - min);
const fmt = v => {
  const s = Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(3);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;   // 只剝小數點後的 0
};

const engine = new PatchEngine();
let patch = emptyPatch();
let pending = null;          // 待接線的來源埠 {id, port, kind}
let audioOn = false;
const held = new Set();

// ── 狀態變更 ────────────────────────────────────────────────
function rebuild() { if (audioOn) engine.buildPatch(patch); }
function mutate(fn, structural = true) {
  fn(patch);
  render();
  if (structural) rebuild();
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2200);
}

function addNode(type) {
  const n = { id: uid(), type, x: 60 + (uidN % 5) * 30, y: 60 + (uidN % 7) * 26,
              params: defaultParams(type), opts: defaultOpts(type) };
  if (type === 'seq') n.steps = Array.from({ length: 16 }, (_, i) => ({ on: i % 4 === 0, semi: 0 }));
  mutate(p => p.nodes.push(n));
}
function removeNode(id) {
  mutate(p => { p.nodes = p.nodes.filter(n => n.id !== id); p.cables = p.cables.filter(c => c.f !== id && c.t !== id); });
}
function addCable(f, fp, t, tp) {
  mutate(p => {
    if (f === t) return;
    p.cables = p.cables.filter(c => !(c.t === t && c.tp === tp));   // 一個輸入埠只接一條
    p.cables.push({ f, fp, t, tp });
  });
}

// ── 繪製 ────────────────────────────────────────────────────
function render() {
  $('#pname').value = patch.name;
  const cv = $('#canvas');
  cv.querySelectorAll('.node').forEach(e => e.remove());
  for (const n of patch.nodes) cv.appendChild(nodeEl(n));
  drawCables();
}

function portEl(n, p, isOut) {
  const d = document.createElement('div');
  d.className = 'port ' + (isOut ? 'out' : 'in');
  d.dataset.node = n.id; d.dataset.port = p.id; d.dataset.kind = p.kind; d.dataset.dir = isOut ? 'out' : 'in';
  d.style.setProperty('--c', KIND_COLOR[p.kind]);
  d.innerHTML = `<i></i><span>${p.label}</span>`;
  d.title = `${p.label}（${p.kind}）`;
  d.addEventListener('click', ev => { ev.stopPropagation(); onPort(n.id, p.id, p.kind, isOut); });
  return d;
}

function nodeEl(n) {
  const def = NODE_DEFS[n.type];
  const el = document.createElement('div');
  el.className = 'node'; el.dataset.id = n.id;
  el.style.left = n.x + 'px'; el.style.top = n.y + 'px';

  const head = document.createElement('div');
  head.className = 'nhead';
  head.innerHTML = `<b>${def.label}</b><button class="x" title="刪除">✕</button>`;
  head.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); removeNode(n.id); });
  head.addEventListener('pointerdown', e => startDrag(e, n, el));
  if (def.hint) head.title = def.hint;
  el.appendChild(head);

  const ports = document.createElement('div');
  ports.className = 'ports';
  const li = document.createElement('div'); li.className = 'pcol';
  const lo = document.createElement('div'); lo.className = 'pcol right';
  def.inputs.forEach(p => li.appendChild(portEl(n, p, false)));
  def.outputs.forEach(p => lo.appendChild(portEl(n, p, true)));
  ports.append(li, lo); el.appendChild(ports);

  for (const o of def.options) {
    const row = document.createElement('div'); row.className = 'orow';
    row.innerHTML = `<label>${o.label}</label>`;
    const sel = document.createElement('select');
    o.choices.forEach(c => { const op = document.createElement('option'); op.value = c.v; op.textContent = c.label; sel.appendChild(op); });
    sel.value = n.opts[o.id] ?? o.def;
    sel.addEventListener('change', () => { n.opts[o.id] = sel.value; engine.setOpt(n.id, o.id, sel.value); });
    row.appendChild(sel); el.appendChild(row);
  }

  for (const pd of def.params) {
    const row = document.createElement('div'); row.className = 'prow';
    const val = document.createElement('span'); val.className = 'pv';
    const cur = () => n.params[pd.id] ?? pd.def;
    const show = () => { val.textContent = fmt(cur()) + (pd.unit || ''); };
    const bar = document.createElement('div'); bar.className = 'slider';
    const fill = document.createElement('i'); bar.appendChild(fill);
    const paint = () => { fill.style.width = (clamp(toRatio(cur(), pd.min, pd.max, pd.log), 0, 1) * 100) + '%'; show(); };
    const set = ev => {
      const r = bar.getBoundingClientRect();
      let v = fromRatio(clamp((ev.clientX - r.left) / r.width, 0, 1), pd.min, pd.max, pd.log);
      if (pd.step) v = Math.round(v / pd.step) * pd.step;
      n.params[pd.id] = clamp(v, pd.min, pd.max);
      engine.setParam(n.id, pd.id, n.params[pd.id]); paint();
    };
    bar.addEventListener('pointerdown', e => { bar.setPointerCapture(e.pointerId); set(e); });
    bar.addEventListener('pointermove', e => { if (e.buttons) set(e); });
    row.innerHTML = `<label>${pd.label}</label>`;
    row.append(bar, val); el.appendChild(row); paint();
  }

  if (n.type === 'seq') {
    const grid = document.createElement('div'); grid.className = 'seq';
    n.steps = n.steps || Array.from({ length: 16 }, () => ({ on: false, semi: 0 }));
    n.steps.forEach((st, i) => {
      const b = document.createElement('button');
      b.className = 'step' + (st.on ? ' on' : '');
      b.textContent = st.on ? st.semi : '·';
      b.title = '左鍵開關，滾輪或上下鍵調半音';
      b.addEventListener('click', () => { st.on = !st.on; b.className = 'step' + (st.on ? ' on' : ''); b.textContent = st.on ? st.semi : '·'; engine.api(n.id, 'setSteps', n.steps); });
      b.addEventListener('wheel', e => { e.preventDefault(); st.semi = clamp(st.semi + (e.deltaY < 0 ? 1 : -1), -24, 24); if (st.on) b.textContent = st.semi; engine.api(n.id, 'setSteps', n.steps); }, { passive: false });
      grid.appendChild(b);
    });
    el.appendChild(grid);
  }
  if (n.type === 'keyboard') {
    const hint = document.createElement('div'); hint.className = 'khint';
    hint.textContent = '用鍵盤 a w s e d f t g y h u j 彈';
    el.appendChild(hint);
  }
  return el;
}

function startDrag(e, n, el) {
  if (e.target.classList.contains('x')) return;
  const box = $('#canvas').getBoundingClientRect();
  const dx = e.clientX - box.left - n.x, dy = e.clientY - box.top - n.y;
  const move = ev => {
    n.x = Math.max(0, ev.clientX - box.left - dx);
    n.y = Math.max(0, ev.clientY - box.top - dy);
    el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
    drawCables();
  };
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
}

function onPort(id, port, kind, isOut) {
  if (!pending) {
    if (!isOut) { toast('先點一個輸出埠（右側），再點輸入埠'); return; }
    pending = { id, port, kind };
    document.body.classList.add('linking');
    highlight();
    toast('已選起點，再點一個輸入埠完成接線');
    return;
  }
  if (isOut) { pending = { id, port, kind }; highlight(); return; }
  const ok = pending.kind === kind || (pending.kind !== 'gate' && kind !== 'gate');
  if (!ok) { toast('gate 只能接 gate'); return; }
  addCable(pending.id, pending.port, id, port);
  pending = null; document.body.classList.remove('linking'); highlight();
}
function highlight() {
  document.querySelectorAll('.port').forEach(p => p.classList.toggle('sel',
    !!pending && p.dataset.node === pending.id && p.dataset.port === pending.port && p.dataset.dir === 'out'));
}

function portPos(nodeId, port, isOut) {
  const el = document.querySelector(`.port[data-node="${nodeId}"][data-port="${port}"][data-dir="${isOut ? 'out' : 'in'}"] i`);
  if (!el) return null;
  const r = el.getBoundingClientRect(), b = $('#canvas').getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2 + $('#canvas').scrollLeft, y: r.top - b.top + r.height / 2 + $('#canvas').scrollTop };
}
function drawCables() {
  const svg = $('#wires'); svg.innerHTML = '';
  patch.cables.forEach((c, idx) => {
    const a = portPos(c.f, c.fp, true), z = portPos(c.t, c.tp, false);
    if (!a || !z) return;
    const src = patch.nodes.find(n => n.id === c.f);
    const kind = (NODE_DEFS[src.type].outputs.find(p => p.id === c.fp) || {}).kind || 'audio';
    const dx = clamp(Math.abs(z.x - a.x) * 0.5, 26, 120);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${z.x - dx} ${z.y}, ${z.x} ${z.y}`);
    path.setAttribute('stroke', KIND_COLOR[kind]);
    path.setAttribute('stroke-width', kind === 'audio' ? 3.4 : 2);
    if (kind === 'cv') path.setAttribute('stroke-dasharray', '7 4');
    if (kind === 'gate') path.setAttribute('stroke-dasharray', '2 5');
    path.setAttribute('fill', 'none');
    path.style.cursor = 'pointer';
    path.addEventListener('click', () => mutate(p => p.cables.splice(idx, 1)));
    path.innerHTML = '<title>點一下刪除這條線</title>';
    svg.appendChild(path);
  });
}

// ── 音訊開關 ────────────────────────────────────────────────
function setAudio(on) {
  audioOn = on;
  if (on) { engine.resume(); engine.buildPatch(patch); } else { engine.suspend(); }
  $('#play').textContent = on ? '■ 停止' : '▶ 開始';
  $('#play').classList.toggle('on', on);
}

// ── 載入 / 儲存 ─────────────────────────────────────────────
function load(p, why) {
  patch = JSON.parse(JSON.stringify(p));
  pending = null; document.body.classList.remove('linking');
  render(); rebuild();
  if (why) toast(why);
}
function shareLink() {
  location.hash = patchToHash(patch);
  navigator.clipboard?.writeText(location.href).then(() => toast('分享連結已複製 ✓'), () => toast('連結已寫進網址列'));
}

// ── 鍵盤 ────────────────────────────────────────────────────
function kbdNodes() { return patch.nodes.filter(n => n.type === 'keyboard').map(n => n.id); }
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const m = KEYMAP[e.key.toLowerCase()];
  if (m === undefined || held.has(m)) return;
  held.add(m); kbdNodes().forEach(id => engine.api(id, 'noteOn', m));
});
window.addEventListener('keyup', e => {
  const m = KEYMAP[e.key.toLowerCase()];
  if (m === undefined) return;
  held.delete(m); kbdNodes().forEach(id => engine.api(id, 'noteOff', m));
});

// ── 示波器 ──────────────────────────────────────────────────
function scope() {
  const cvs = $('#scope'), g = cvs.getContext('2d');
  const draw = () => {
    requestAnimationFrame(draw);
    const w = cvs.width = cvs.clientWidth * 2, h = cvs.height = cvs.clientHeight * 2;
    g.clearRect(0, 0, w, h);
    if (!engine.analyser) return;
    const buf = new Uint8Array(engine.analyser.fftSize);
    engine.analyser.getByteTimeDomainData(buf);
    g.beginPath(); g.strokeStyle = '#e0a94e'; g.lineWidth = 2.5;
    for (let i = 0; i < buf.length; i++) {
      const x = (i / buf.length) * w, y = (buf[i] / 128 - 1) * (h / 2.4) + h / 2;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  };
  draw();
}

// ── 啟動 ────────────────────────────────────────────────────
function init() {
  const pal = $('#palette');
  PALETTE.forEach(t => {
    const b = document.createElement('button');
    b.textContent = NODE_DEFS[t].label.split(' ')[0];
    b.title = NODE_DEFS[t].label + (NODE_DEFS[t].hint ? '\n' + NODE_DEFS[t].hint : '');
    b.addEventListener('click', () => addNode(t));
    pal.appendChild(b);
  });
  const sel = $('#presets');
  PRESETS.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = (p.ch ? `［${p.ch}］` : '') + p.name;
    sel.appendChild(o);
  });
  sel.addEventListener('change', () => {
    const p = PRESETS.find(x => x.id === sel.value);
    if (p) { load(p.patch, '已載入：' + p.patch.name); if (!audioOn) toast('已載入，按「▶ 開始」才會出聲'); }
  });

  $('#play').addEventListener('click', () => setAudio(!audioOn));
  $('#share').addEventListener('click', shareLink);
  $('#save').addEventListener('click', () => { localStorage.setItem(LS_KEY, JSON.stringify(patch)); toast('已存到這台電腦'); });
  $('#clear').addEventListener('click', () => { if (confirm('清空目前的 patch？')) load(emptyPatch(), '已清空'); });
  $('#pname').addEventListener('input', e => { patch.name = e.target.value; });
  $('#canvas').addEventListener('click', () => { if (pending) { pending = null; document.body.classList.remove('linking'); highlight(); } });
  window.addEventListener('resize', drawCables);

  // 載入順序：?preset=<id>（教材用的短連結）> #p=<base64>（分享連結）> 上次存檔 > 第一個範例
  const wanted = new URLSearchParams(location.search).get('preset');
  const pre = wanted && PRESETS.find(x => x.id === wanted);
  const fromHash = patchFromHash(location.hash);
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch {}
  load((pre && pre.patch) || fromHash || saved || PRESETS[0].patch);
  if (pre) { sel.value = pre.id; toast('已載入：' + pre.patch.name + '，按「▶ 開始」出聲'); }
  else if (fromHash) toast('已從連結載入 patch，按「▶ 開始」出聲');
  scope();
}
init();
