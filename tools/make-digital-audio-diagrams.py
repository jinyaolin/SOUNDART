#!/usr/bin/env python3
"""產生「4.5 類比、數位與 Buffer」這一章的所有插圖。

整章共用同一段正弦波(SIG),所以學生在不同投影片上看到的是同一個訊號被
逐步處理:連續波形 → 取樣點 → 數值陣列 → 分塊。要調整波形只改 CYCLES /
AMP 一處,全部的圖跟著變。

用法:python3 tools/make-digital-audio-diagrams.py
輸出:images/diagrams/da-*.svg
"""

import html
import math
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "images", "diagrams")

W = 720
BG = "#1d1811"
TITLE = "#f0c87d"
INK = "#f2ece1"
DIM = "#a89f92"
GOLD = "#e0a94e"
TEAL = "#6fbfae"
RED = "#d97757"
LINE = "#3a3229"
FONT = "-apple-system,'PingFang TC','Noto Sans CJK TC','Microsoft JhengHei',sans-serif"
MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace"

# ── 全章共用的訊號 ──────────────────────────────────────────
CYCLES = 2.0     # 繪圖寬度內的週期數
PHASE = 0.0


def fmt(v):
    """格式化取樣值,避免出現 -0.00。"""
    if abs(v) < 0.005:
        v = 0.0
    return "%+.2f" % v


def sig(t):
    """t 為 0..1 的相對位置,回傳 -1..1。整章共用這一條。"""
    return math.sin(2 * math.pi * (CYCLES * t) + PHASE)


# ── SVG 小工具 ─────────────────────────────────────────────
def esc(s):
    return html.escape(str(s), quote=True)


def head(h, title=None):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" '
         f'width="{W}" height="{h}" font-family="{FONT}" role="img">\n'
         f'<rect width="{W}" height="{h}" rx="10" fill="{BG}"/>\n')
    if title:
        s += txt(W / 2, 30, title, 17, TITLE, "middle", 600)
    return s


def txt(x, y, s, size=13, fill=INK, anchor="middle", weight=400, mono=False, opacity=None):
    f = f' font-family="{MONO}"' if mono else ""
    o = f' opacity="{opacity}"' if opacity is not None else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" font-weight="{weight}"{f}{o}>{esc(s)}</text>\n')


def line(x1, y1, x2, y2, stroke=LINE, w=1, dash=None, cap="round", opacity=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o = f' opacity="{opacity}"' if opacity is not None else ""
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{stroke}" stroke-width="{w}" stroke-linecap="{cap}"{d}{o}/>\n')


def rect(x, y, w, h, stroke=None, fill="none", rx=6, sw=2, dash=None, opacity=None):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o = f' opacity="{opacity}"' if opacity is not None else ""
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
            f'rx="{rx}" fill="{fill}"{st}{d}{o}/>\n')


def circle(cx, cy, r, fill=GOLD, stroke=None, sw=1.5):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}"{st}/>\n'


def wave(x0, yc, w, amp, fn=sig, stroke=TEAL, sw=2, n=400, opacity=None):
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append(f"{x0 + t * w:.2f},{yc - fn(t) * amp:.2f}")
    o = f' opacity="{opacity}"' if opacity is not None else ""
    return (f'<polyline points="{" ".join(pts)}" fill="none" stroke="{stroke}" '
            f'stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"{o}/>\n')


def arrow(x1, y1, x2, y2, stroke=DIM, w=1.6):
    ang = math.atan2(y2 - y1, x2 - x1)
    a, b = 7, 0.42
    p1 = (x2 - a * math.cos(ang - b), y2 - a * math.sin(ang - b))
    p2 = (x2 - a * math.cos(ang + b), y2 - a * math.sin(ang + b))
    return (line(x1, y1, x2, y2, stroke, w)
            + f'<polygon points="{x2:.1f},{y2:.1f} {p1[0]:.1f},{p1[1]:.1f} '
              f'{p2[0]:.1f},{p2[1]:.1f}" fill="{stroke}"/>\n')


def box(x, y, w, h, label, sub=None, stroke=TEAL, fill="none"):
    s = rect(x, y, w, h, stroke, fill, rx=7)
    if sub:
        s += txt(x + w / 2, y + h / 2 - 3, label, 14, INK, weight=600)
        s += txt(x + w / 2, y + h / 2 + 15, sub, 11, DIM)
    else:
        s += txt(x + w / 2, y + h / 2 + 5, label, 14, INK, weight=600)
    return s


def save(name, body):
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(body + "</svg>\n")
    print("  %-34s %5d bytes" % (name, os.path.getsize(path)))


# ── 1. 整堂課的問題 ────────────────────────────────────────
def d01():
    h = 230
    s = head(h, "聲音是振動,電腦處理的是數字。中間發生了什麼事?")
    y = 105
    s += box(55, y - 34, 150, 68, "麥克風", "接收空氣振動", TEAL)
    s += box(285, y - 34, 150, 68, "電腦", "?", GOLD)
    s += box(515, y - 34, 150, 68, "喇叭", "推動空氣振動", TEAL)
    s += arrow(212, y, 278, y)
    s += arrow(442, y, 508, y)
    s += txt(360, y + 62, "這一段就是這堂課要拆開的地方", 12.5, DIM)
    s += txt(360, h - 16, "先請學生猜:電腦裡面存的到底是什麼?", 11.5, DIM, opacity=0.85)
    return h, s


# ── 2. 聲音是隨時間變化的振動 ───────────────────────────────
def d02():
    h = 285
    s = head(h, "聲音是介質中的壓力變化,波形描述它如何隨時間改變")
    x0, wdt = 60, 600
    # 上:用垂直線的疏密表示空氣壓縮/稀疏,x 位置被同一條 sig 擾動
    yt = 78
    s += txt(48, yt - 14, "空氣", 12, DIM, "start")
    N = 150
    for i in range(N):
        t = i / (N - 1)
        # 位移量與 sig 同相:正值處線往左擠 → 形成壓縮帶
        off = -sig(t) * (wdt / CYCLES) * 0.11
        x = x0 + t * wdt + off
        if x0 - 2 <= x <= x0 + wdt + 2:
            s += line(x, yt, x, yt + 40, DIM, 1.1, opacity=0.75)
    # 密/疏 標在真正的波峰與波谷 x 位置
    for k, (lbl, col) in enumerate([("密", GOLD), ("疏", TEAL)]):
        for c in range(int(CYCLES)):
            tt = (c + (0.25 if k == 0 else 0.75)) / CYCLES
            s += txt(x0 + tt * wdt, yt + 58, lbl, 11.5, col)
    # 下:波形(與上方共用同一條 sig,x 對齊)
    yc = 200
    s += line(x0, yc, x0 + wdt, yc, LINE, 1)
    s += wave(x0, yc, wdt, 44, stroke=TEAL, sw=2.2)
    s += line(x0, yc - 60, x0, yc + 60, LINE, 1)
    s += arrow(x0, yc, x0 + wdt + 12, yc, DIM, 1.2)
    s += txt(x0 + wdt + 16, yc + 4, "時間", 11.5, DIM, "start")
    s += txt(x0 - 8, yc - 62, "振幅", 11.5, DIM, "end")
    s += txt(x0 - 8, yc - 38, "+", 12, DIM, "end")
    s += txt(x0 - 8, yc + 46, "−", 12, DIM, "end")
    # 對齊輔助線:讓學生看見「壓縮帶 ↔ 波峰」
    for c in range(int(CYCLES)):
        tt = (c + 0.25) / CYCLES
        s += line(x0 + tt * wdt, yt + 44, x0 + tt * wdt, yc - 44, GOLD, 0.9,
                  dash="3 4", opacity=0.4)
    s += txt(360, h - 12, "壓縮處對應波峰;橫軸是時間,縱軸是壓力偏離量", 11.5, DIM)
    return h, s


# ── 3. 振幅與頻率 ──────────────────────────────────────────
def d03():
    h = 300
    s = head(h, "波形的兩個基本量:振幅關聯強弱,頻率關聯音高")
    def panel(x0, y0, title, amp, cyc, color):
        out = txt(x0 + 145, y0 - 26, title, 12.5, DIM)
        out += rect(x0, y0 - 14, 290, 88, LINE, "none", rx=6, sw=1)
        out += line(x0 + 12, y0 + 30, x0 + 278, y0 + 30, LINE, 1)
        out += wave(x0 + 12, y0 + 30, 266, amp,
                    fn=lambda t, c=cyc: math.sin(2 * math.pi * c * t), stroke=color, sw=2)
        return out
    s += panel(50, 92, "同頻率・振幅大", 30, CYCLES, TEAL)
    s += panel(380, 92, "同頻率・振幅小", 12, CYCLES, TEAL)
    s += panel(50, 220, "同振幅・頻率低", 24, CYCLES, GOLD)
    s += panel(380, 220, "同振幅・頻率高", 24, CYCLES * 3, GOLD)
    s += txt(195, h - 12, "振幅 → 聽起來多大聲", 11.5, TEAL)
    s += txt(525, h - 12, "頻率 → 聽起來多高", 11.5, GOLD)
    return h, s


# ── 4. Analog ─────────────────────────────────────────────
def d04():
    h = 250
    s = head(h, "Analog:用連續變化的物理量表示聲音")
    s += box(40, 96, 118, 58, "聲壓變化", None, TEAL)
    s += arrow(164, 125, 208, 125)
    s += box(214, 96, 108, 58, "麥克風", None, GOLD)
    s += arrow(328, 125, 372, 125)
    yc = 125
    s += rect(378, 78, 302, 94, LINE, "none", rx=7, sw=1)
    s += line(392, yc, 666, yc, LINE, 1)
    s += wave(392, yc, 274, 34, stroke=GOLD, sw=2.2)
    s += txt(529, 68, "連續變化的電壓", 12.5, DIM)
    s += txt(360, h - 34, "波形的形狀一樣,只是換了一種物理量來承載", 12.5, INK)
    s += txt(360, h - 14, "類比訊號在任何時間點都有值,沒有「中間空白」", 11.5, DIM)
    return h, s


# ── 5. Digital:取樣與量化 ──────────────────────────────────
def d05():
    h = 300
    s = head(h, "Digital:在特定時間記錄數值(取樣 + 量化)")
    x0, wdt, yc, amp = 70, 570, 130, 52
    s += line(x0, yc, x0 + wdt, yc, LINE, 1)
    s += wave(x0, yc, wdt, amp, stroke=TEAL, sw=1.6, opacity=0.5)
    n = 16
    vals = []
    for i in range(n + 1):
        t = i / n
        x = x0 + t * wdt
        v = sig(t)
        y = yc - v * amp
        s += line(x, yc, x, y, GOLD, 1.2, opacity=0.55)
        s += circle(x, y, 3.6, GOLD)
        vals.append(v)
    s += txt(360, 74, "① 每隔固定時間量一次(取樣)", 12.5, DIM)
    # 數值陣列
    s += txt(360, 212, "② 把量到的振幅寫成數字(量化)", 12.5, DIM)
    bx = 44
    for i, v in enumerate(vals[:13]):
        s += rect(bx + i * 48, 228, 44, 30, LINE, "none", rx=4, sw=1)
        s += txt(bx + i * 48 + 22, 248, fmt(v), 10.5, GOLD, mono=True)
    s += txt(bx + 13 * 48 + 14, 248, "…", 13, DIM, "start")
    s += txt(360, h - 12, "程式看到的就是這一串數字,不是波形", 11.5, INK)
    return h, s


# ── 6. Sample Rate ────────────────────────────────────────
def d06():
    h = 300
    s = head(h, "Sample Rate:每秒取樣多少次?")
    def strip(y0, n, label, color):
        out = txt(64, y0 - 30, label, 12.5, DIM, "start")
        out += line(64, y0, 656, y0, LINE, 1)
        out += wave(64, y0, 592, 40, stroke=TEAL, sw=1.5, opacity=0.45)
        for i in range(n + 1):
            t = i / n
            x = 64 + t * 592
            out += line(x, y0, x, y0 - sig(t) * 40, color, 1.1, opacity=0.6)
            out += circle(x, y0 - sig(t) * 40, 3.2, color)
        return out
    s += strip(112, 8, "取樣疏(間隔長)", RED)
    s += strip(232, 32, "取樣密(間隔短)", GOLD)
    s += rect(430, 252, 250, 34, LINE, "none", rx=6, sw=1)
    s += txt(555, 274, "48 kHz = 每聲道每秒 48,000 次", 12, GOLD, mono=True)
    s += txt(64, 274, "取樣間隔 1 / 48000 ≈ 20.83 µs", 12, DIM, "start")
    return h, s


# ── 7. Aliasing ───────────────────────────────────────────
def d07():
    h = 285
    s = head(h, "取樣太慢:不同頻率會產生無法區分的取樣結果")
    x0, wdt, yc, amp = 64, 592, 140, 48
    s += line(x0, yc, x0 + wdt, yc, LINE, 1)
    # 真實高頻
    hi = lambda t: math.sin(2 * math.pi * 7 * t)
    s += wave(x0, yc, wdt, amp, fn=hi, stroke=TEAL, sw=1.6, opacity=0.55)
    # 取樣點(太疏)
    n = 8
    pts = []
    for i in range(n + 1):
        t = i / n
        x = x0 + t * wdt
        y = yc - hi(t) * amp
        s += circle(x, y, 4, RED)
        pts.append(f"{x:.1f},{y:.1f}")
    # 連起來變成低頻
    s += (f'<polyline points="{" ".join(pts)}" fill="none" stroke="{RED}" '
          f'stroke-width="2.2" stroke-dasharray="6 4" stroke-linejoin="round"/>\n')
    s += txt(x0, 72, "真實訊號(高頻)", 12, TEAL, "start")
    s += txt(x0 + wdt, 72, "取樣點連起來 → 變成另一個較低的頻率", 12, RED, "end")
    s += rect(64, 208, 592, 58, LINE, "none", rx=7, sw=1)
    s += txt(360, 230, "理想帶限條件下,取樣率須高於訊號最高頻率的兩倍", 12.5, INK)
    s += txt(360, 250, "實務上在 ADC 前先加抗混疊濾波器,把過高的頻率濾掉", 11.5, DIM)
    return h, s


# ── 7b. Nyquist 頻率 ──────────────────────────────────────
def d07b():
    h = 275
    s = head(h, "Nyquist 頻率:取樣率的一半,就是能正確表示的上限")
    x0, wdt, ax = 70, 580, 168
    # 頻率軸
    s += arrow(x0, ax, x0 + wdt + 16, ax, DIM, 1.4)
    s += txt(x0 + wdt + 22, ax + 4, "頻率", 11.5, DIM, "start")
    half = x0 + wdt / 2
    # 可用頻帶
    s += rect(x0, ax - 46, wdt / 2, 46, TEAL, TEAL, rx=0, sw=1.4, opacity=0.16)
    s += rect(x0, ax - 46, wdt / 2, 46, TEAL, "none", rx=0, sw=1.6)
    s += txt(x0 + wdt / 4, ax - 20, "可以正確表示", 12.5, TEAL)
    # 超過的區域
    s += rect(half, ax - 46, wdt / 2, 46, RED, RED, rx=0, sw=1.4, opacity=0.12)
    s += txt(half + wdt / 4, ax - 26, "超過就會混疊", 12.5, RED)
    s += txt(half + wdt / 4, ax - 9, "被折回左邊的頻帶", 10.5, DIM)
    # 折返示意
    s += (f'<path d="M {half + wdt * 0.34:.1f} {ax - 62:.1f} '
          f'Q {half:.1f} {ax - 96:.1f} {half - wdt * 0.30:.1f} {ax - 62:.1f}" '
          f'fill="none" stroke="{RED}" stroke-width="1.8" stroke-dasharray="5 4"/>\n')
    s += arrow(half - wdt * 0.28, ax - 63, half - wdt * 0.31, ax - 58, RED, 1.6)
    s += txt(half, ax - 104, "折返(fold back)", 11, RED)
    # 刻度
    for xx, lab, sub, col in ((x0, "0", "", DIM),
                              (half, "fs / 2", "Nyquist 頻率", GOLD),
                              (x0 + wdt, "fs", "取樣率", DIM)):
        s += line(xx, ax - 6, xx, ax + 8, col, 1.6)
        s += txt(xx, ax + 26, lab, 12.5, col, weight=600, mono=True)
        if sub:
            s += txt(xx, ax + 44, sub, 11, col)
    # 具體數字
    s += rect(x0, 212, wdt, 44, LINE, "none", rx=7, sw=1)
    s += txt(x0 + wdt / 2, 232, "48 kHz → Nyquist 頻率 24 kHz　|　44.1 kHz → 22.05 kHz", 12.5, INK)
    s += txt(x0 + wdt / 2, 249, "人耳上限約 20 kHz,所以兩者都夠用", 11, DIM)
    return h, s


# ── 8. Bit Depth ──────────────────────────────────────────
def d08():
    h = 300
    s = head(h, "Bit Depth:振幅能分成多少階?")
    def panel(x0, title, levels, color):
        yc, amp, wdt = 150, 46, 268
        out = txt(x0 + wdt / 2, 74, title, 12.5, DIM)
        out += rect(x0 - 8, 88, wdt + 16, 128, LINE, "none", rx=7, sw=1)
        for k in range(levels + 1):
            yy = yc - amp + k * (2 * amp / levels)
            out += line(x0, yy, x0 + wdt, yy, LINE, 0.8, opacity=0.55)
        out += wave(x0, yc, wdt, amp, stroke=TEAL, sw=1.4, opacity=0.45)
        # 階梯化
        n = 40
        pts = []
        for i in range(n + 1):
            t = i / n
            v = sig(t)
            q = round(v * (levels / 2)) / (levels / 2)
            q = max(-1.0, min(1.0, q))
            x = x0 + t * wdt
            y = yc - q * amp
            if pts:
                pts.append(f"{x:.1f},{float(pts[-1].split(',')[1]):.1f}")
            pts.append(f"{x:.1f},{y:.1f}")
        out += (f'<polyline points="{" ".join(pts)}" fill="none" stroke="{color}" '
                f'stroke-width="2" stroke-linejoin="miter"/>\n')
        return out
    s += panel(60, "階數少 → 量化誤差明顯", 6, RED)
    s += panel(392, "階數多 → 誤差變小", 20, GOLD)
    s += rect(60, 232, 600, 52, LINE, "none", rx=7, sw=1)
    s += txt(360, 254, "固定整數 PCM:b bits 可表示 2^b 個碼值", 12.5, INK)
    s += txt(360, 273, "16-bit = 65,536 階;量化一定有誤差,只是大小不同", 11.5, DIM)
    return h, s


# ── 9. Sample Rate vs Bit Depth ───────────────────────────
def d09():
    h = 300
    s = head(h, "兩者不可混用:一個講時間,一個講振幅")
    x0, wdt, yc, amp = 130, 460, 150, 58
    levels = 8
    for k in range(levels + 1):
        yy = yc - amp + k * (2 * amp / levels)
        s += line(x0, yy, x0 + wdt, yy, LINE, 0.8, opacity=0.5)
    n = 16
    for i in range(n + 1):
        x = x0 + (i / n) * wdt
        s += line(x, yc - amp, x, yc + amp, GOLD, 0.9, opacity=0.32, dash="2 3")
    s += wave(x0, yc, wdt, amp, stroke=TEAL, sw=1.8, opacity=0.75)
    for i in range(n + 1):
        t = i / n
        v = sig(t)
        q = round(v * (levels / 2)) / (levels / 2)
        s += circle(x0 + t * wdt, yc - max(-1, min(1, q)) * amp, 3.4, GOLD)
    # 標註
    # 把「一個取樣間隔」用括弧標在圖上,不要浮在旁邊
    ax, aw = x0, wdt / n
    s += line(ax, yc + amp + 8, ax, yc + amp + 20, GOLD, 1.2)
    s += line(ax + aw, yc + amp + 8, ax + aw, yc + amp + 20, GOLD, 1.2)
    s += arrow(ax, yc + amp + 14, ax + aw, yc + amp + 14, GOLD, 1.3)
    s += txt(ax + aw / 2 + 44, yc + amp + 40, "一個取樣間隔", 11.5, GOLD)
    s += txt(x0 + wdt / n / 2 + 44, yc + amp + 56, "(水平・Sample Rate)", 10.5, DIM)
    s += arrow(x0 - 26, yc - amp, x0 - 26, yc - amp + (2 * amp / levels), TEAL, 1.4)
    s += txt(x0 - 34, yc - amp + 12, "量化階", 11.5, TEAL, "end")
    s += txt(x0 - 34, yc - amp + 28, "(垂直・Bit Depth)", 10.5, DIM, "end")
    s += txt(360, h - 14, "同一張圖:橫的是取樣密度,直的是振幅精細度", 11.5, INK)
    return h, s


# ── 10. 訊號鏈 ────────────────────────────────────────────
def d10():
    h = 265
    s = head(h, "從聲音到數字,再回到聲音")
    y = 96
    names = [("麥克風", "聲波→電壓", TEAL), ("ADC", "取樣+量化", GOLD),
             ("數位處理", "程式在這裡", GOLD), ("DAC", "數值→電壓", GOLD),
             ("喇叭", "電壓→聲波", TEAL)]
    bw, gap = 116, 20
    x = (W - (bw * 5 + gap * 4)) / 2
    for i, (nm, sub, c) in enumerate(names):
        bx = x + i * (bw + gap)
        s += box(bx, y, bw, 58, nm, sub, c)
        if i < 4:
            s += arrow(bx + bw + 3, y + 29, bx + bw + gap - 3, y + 29)
    # 放大數值
    s += line(x + 2 * (bw + gap) + bw / 2, y + 62, 360, 176, LINE, 1, dash="4 4")
    s += rect(96, 176, 528, 42, GOLD, "none", rx=7, sw=1.5)
    seq = [fmt(sig(i / 16)) for i in range(10)]
    s += txt(360, 202, "  ".join(seq) + "  …", 12, GOLD, mono=True)
    s += txt(360, h - 14, "程式拿到的是依時間排列的取樣值", 11.5, DIM)
    return h, s


# ── 11. 聲音不能停下來等電腦 ────────────────────────────────
def d11():
    h = 265
    s = head(h, "音效裝置按固定時鐘走,CPU 的節奏卻會抖")
    y1 = 100
    s += txt(56, y1 - 26, "音效裝置:等距、不會等人", 12, TEAL, "start")
    for i in range(13):
        x = 60 + i * 50
        s += line(x, y1, x, y1 + 26, TEAL, 2.4)
    s += arrow(56, y1 + 13, 668, y1 + 13, LINE, 1)
    y2 = 190
    s += txt(56, y2 - 26, "CPU:忙碌程度會變動", 12, GOLD, "start")
    widths = [26, 44, 18, 62, 30, 22, 78, 34, 20, 48]
    x = 60
    for wdt in widths:
        s += rect(x, y2, wdt, 26, GOLD, "none", rx=4, sw=1.6)
        x += wdt + 8
    s += txt(360, h - 14, "即時音訊的要求:每一批資料都要「準時」交出去", 11.5, INK)
    return h, s


# ── 12. 逐筆 vs 整批 ──────────────────────────────────────
def d12():
    h = 275
    s = head(h, "為什麼一次處理一批?")
    y1 = 96
    s += txt(56, y1 - 24, "逐筆交付:每一筆都付一次固定開銷", 12, RED, "start")
    for i in range(24):
        x = 62 + i * 25
        s += rect(x, y1, 12, 24, RED, "none", rx=2, sw=1.2)
        s += rect(x + 13, y1 + 4, 9, 16, DIM, DIM, rx=2, sw=0, opacity=0.45)
    s += txt(660, y1 + 40, "灰色 = 每次呼叫的固定成本", 10.5, DIM, "end")
    y2 = 190
    s += txt(56, y2 - 24, "整批交付:同樣的取樣數,開銷只付幾次", 12, GOLD, "start")
    for b in range(4):
        x = 62 + b * 150
        s += rect(x, y2, 128, 24, GOLD, "none", rx=4, sw=1.6)
        s += rect(x + 129, y2 + 4, 9, 16, DIM, DIM, rx=2, sw=0, opacity=0.45)
        s += txt(x + 64, y2 + 17, "一批", 11, INK)
    s += txt(360, h - 14, "批內仍然是一筆一筆算,省的是「交付」的次數", 11.5, INK)
    return h, s


# ── 13. Buffer 與 block ───────────────────────────────────
def d13():
    h = 260
    s = head(h, "Buffer 是暫存空間,block 是一次處理的區塊")
    bx, by = 44, 92
    cw = 41
    for i in range(16):
        v = sig(i / 16)
        s += rect(bx + i * cw, by, cw - 4, 30, LINE, "none", rx=3, sw=1)
        s += txt(bx + i * cw + (cw - 4) / 2, by + 20, fmt(v), 9.5, GOLD, mono=True)
    for b in range(4):
        x = bx + b * 4 * cw - 4
        s += rect(x, by - 12, 4 * cw - 4, 54, TEAL, "none", rx=6, sw=1.8, dash="5 4")
        s += txt(x + (4 * cw - 4) / 2, by - 20, f"block {b + 1}", 11, TEAL)
    s += txt(360, 178, "同一串取樣值,被框成一塊一塊送去處理", 12.5, INK)
    s += rect(60, 196, 600, 48, LINE, "none", rx=7, sw=1)
    s += txt(360, 216, "處理大小(block)、儲存容量(buffer)、實際排隊量", 12, DIM)
    s += txt(360, 234, "是三件不同的事,不要混為一談", 11.5, DIM)
    return h, s


# ── 14. 雙緩衝 ────────────────────────────────────────────
def d14():
    h = 250
    s = head(h, "一邊播放,一邊準備下一批")
    for row, (playing, computing) in enumerate([("A", "B"), ("B", "A")]):
        y = 90 + row * 74
        s += txt(52, y + 26, f"時段 {row + 1}", 12, DIM, "start")
        s += rect(140, y, 230, 46, TEAL, "none", rx=7, sw=2)
        s += txt(255, y + 21, f"Buffer {playing}", 13, INK, weight=600)
        s += txt(255, y + 37, "硬體正在播放", 10.5, TEAL)
        s += rect(400, y, 230, 46, GOLD, "none", rx=7, sw=2, dash="6 4")
        s += txt(515, y + 21, f"Buffer {computing}", 13, INK, weight=600)
        s += txt(515, y + 37, "程式正在計算", 10.5, GOLD)
    s += arrow(640, 113, 655, 113, DIM, 1.4)
    s += arrow(655, 187, 640, 187, DIM, 1.4)
    s += txt(360, h - 14, "兩塊輪流交換角色;實際系統可能有更多層", 11.5, DIM)
    return h, s


# ── 16. Buffer 大小比較 ───────────────────────────────────
def d16():
    h = 270
    s = head(h, "Buffer 調小:反應快,但每次的期限也更短")
    def row(y, cells, label, color, note):
        out = txt(56, y - 22, label, 12, color, "start")
        cw = 592 / cells
        for i in range(cells):
            out += rect(60 + i * cw, y, cw - 3, 30, color, "none", rx=3, sw=1.4)
        out += txt(660, y + 48, note, 10.5, DIM, "end")
        return out
    s += row(98, 16, "64 frames:格子密 → 呼叫頻繁、每格期限短", GOLD, "1.33 ms / 格")
    s += row(190, 2, "512 frames:格子疏 → 呼叫少、每格期限長", TEAL, "10.67 ms / 格")
    s += txt(360, h - 14, "同一段時間,切法不同;每一格都必須在格子結束前算完", 11.5, INK)
    return h, s


# ── 17. 兩種情境的取捨 ────────────────────────────────────
def d17():
    h = 300
    s = head(h, "同一個旋鈕,兩種相反的需求")
    # 取捨軸
    ay = 96
    s += line(70, ay, 650, ay, LINE, 1.6)
    s += arrow(360, ay, 78, ay, TEAL, 1.6)
    s += arrow(360, ay, 642, ay, GOLD, 1.6)
    s += txt(190, ay - 14, "buffer 小", 12.5, TEAL, weight=600)
    s += txt(530, ay - 14, "buffer 大", 12.5, GOLD, weight=600)

    def panel(x0, color, title, sub, cells, cw, rows):
        out = rect(x0, 128, 290, 148, color, "none", rx=8, sw=1.6)
        out += txt(x0 + 145, 152, title, 13.5, color, weight=600)
        out += txt(x0 + 145, 170, sub, 11, DIM)
        # buffer 格子示意
        gy = 184
        tot = 250
        w1 = tot / cells
        for i in range(cells):
            out += rect(x0 + 20 + i * w1, gy, w1 - 3, 18, color, "none", rx=2, sw=1.2)
        for j, r in enumerate(rows):
            out += txt(x0 + 145, 226 + j * 18, r, 11.5, INK)
        return out

    s += panel(50, TEAL, "即時演奏・監聽", "延遲聽得出來", 10, 25,
               ["延遲要短", "每格期限緊,容易爆音"])
    s += panel(380, GOLD, "非即時混音・輸出", "延遲無所謂", 3, 83,
               ["餘裕大,不怕短暫尖峰", "開銷攤得開,跑得穩"])
    s += txt(360, h - 12, "沒有「正確」的 buffer 大小,只有適合當下用途的大小", 11.5, DIM)
    return h, s


# ── 18. Underflow ─────────────────────────────────────────
def d18():
    h = 275
    s = head(h, "來不及交付,就可能斷音")
    y = 108
    cw = 118
    for i in range(5):
        x = 60 + i * cw
        s += line(x, y - 20, x, y + 74, LINE, 1, dash="3 3")
        s += txt(x + cw / 2, y - 26, f"期限 {i + 1}", 10.5, DIM)
    s += line(60 + 5 * cw, y - 20, 60 + 5 * cw, y + 74, LINE, 1, dash="3 3")
    loads = [58, 72, 64, 152, 60]
    for i, ld in enumerate(loads):
        x = 60 + i * cw
        over = ld > cw - 10
        s += rect(x + 4, y, min(ld, 640 - x), 34, RED if over else GOLD, "none", rx=4, sw=1.7)
        if over:
            s += txt(x + 4 + cw / 2, y + 22, "超過期限", 11, RED)
    s += rect(60 + 3 * cw + 4, y + 44, cw - 8, 26, RED, RED, rx=4, sw=0, opacity=0.22)
    s += txt(60 + 3 * cw + cw / 2, y + 62, "輸出缺口 → 爆音", 10.5, RED)
    s += rect(60, 196, 600, 56, LINE, "none", rx=7, sw=1)
    s += txt(360, 217, "輸出供應不及 = underflow;輸入來不及取走 = overflow", 12, INK)
    s += txt(360, 237, "平均 CPU 使用率低,仍可能因為單次尖峰錯過期限", 11.5, DIM)
    return h, s


# ── 19. 延遲不只一處 ──────────────────────────────────────
def d19():
    h = 250
    s = head(h, "區塊時長,不等於總延遲")
    y = 108
    stops = [("麥克風", TEAL), ("ADC", GOLD), ("輸入緩衝", GOLD), ("處理", GOLD),
             ("輸出緩衝", GOLD), ("DAC", GOLD), ("喇叭", TEAL)]
    bw, gap = 82, 14
    x0 = (W - (bw * 7 + gap * 6)) / 2
    for i, (nm, c) in enumerate(stops):
        x = x0 + i * (bw + gap)
        s += rect(x, y, bw, 42, c, "none", rx=6, sw=1.6)
        s += txt(x + bw / 2, y + 26, nm, 11.5, INK)
        if i < 6:
            s += arrow(x + bw + 2, y + 21, x + bw + gap - 2, y + 21)
        s += txt(x + bw / 2, y + 60, "+延遲", 10, DIM)
    s += txt(360, y + 92, "每一段都會累積,不能只用單一 buffer 推算整條路徑", 12, INK)
    s += txt(360, h - 14, "驅動、轉換器與演算法本身也各有延遲", 11.5, DIM)
    return h, s


# ── 20. 銜接 Pure Data ────────────────────────────────────
def d20():
    h = 240
    s = head(h, "接下來:讓 Pure Data 幫我們處理這些事")
    y = 92
    objs = [("[osc~ 440]", "產生 440 Hz 正弦波"), ("[*~ 0.1]", "把振幅降到 0.1"),
            ("[dac~]", "送到音效輸出")]
    bw, gap = 176, 34
    x0 = (W - (bw * 3 + gap * 2)) / 2
    for i, (nm, sub) in enumerate(objs):
        x = x0 + i * (bw + gap)
        s += rect(x, y, bw, 52, GOLD, "none", rx=5, sw=1.8)
        s += txt(x + bw / 2, y + 24, nm, 15, GOLD, weight=600, mono=True)
        s += txt(x + bw / 2, y + 42, sub, 10.5, DIM)
        if i < 2:
            s += arrow(x + bw + 4, y + 26, x + bw + gap - 4, y + 26)
    s += rect(90, 168, 540, 50, LINE, "none", rx=7, sw=1)
    s += txt(360, 189, "Pd 把這些運算組成 DSP 網路,並且分塊執行", 12.5, INK)
    s += txt(360, 208, "你剛學的取樣率與 block,就是它背後在做的事", 11.5, DIM)
    return h, s


DIAGRAMS = [
    ("da-01-question.svg", d01), ("da-02-pressure-wave.svg", d02),
    ("da-03-amp-freq.svg", d03), ("da-04-analog.svg", d04),
    ("da-05-sampling.svg", d05), ("da-06-samplerate.svg", d06),
    ("da-07-aliasing.svg", d07), ("da-07b-nyquist.svg", d07b),
    ("da-08-bitdepth.svg", d08),
    ("da-09-sr-vs-bd.svg", d09), ("da-10-chain.svg", d10),
    ("da-11-clock-vs-cpu.svg", d11), ("da-12-batch.svg", d12),
    ("da-13-buffer-blocks.svg", d13), ("da-14-double-buffer.svg", d14),
    ("da-16-buffer-size.svg", d16), ("da-17-tradeoff.svg", d17),
    ("da-18-underrun.svg", d18),
    ("da-19-latency-path.svg", d19), ("da-20-pd-preview.svg", d20),
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("產生 %d 張圖 → %s" % (len(DIAGRAMS), OUT))
    for name, fn in DIAGRAMS:
        hgt, body = fn()
        save(name, body)
    print("完成")
