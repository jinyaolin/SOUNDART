#!/usr/bin/env python3
"""下載第 3 章的樂器實拍照(Wikimedia Commons)並產生授權標註。

為什麼不用 AI 生圖:這一章講的是真實的歷史樂器。生成的「Minimoog」會是
看起來合理但實際錯誤的東西,在歷史章節裡等於教錯。所以一律用實拍照。

授權挑選順序:Public domain / CC0 > CC BY > CC BY-SA。全部在
images/instruments/CREDITS.md 標明作者、授權與原始頁面。

用法:python3 tools/fetch-instrument-photos.py
"""

import json
import os
import time
import re
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "images", "instruments")
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "SOUNDART-teaching-material/1.0 (educational use)"}

# slug, Commons 檔名, 說明(給 alt 與圖說用)
PICKS = [
    ("telharmonium", "Teleharmonium1897.jpg",
     "Telharmonium（1897 年設計）：重達 200 噸，用發電機組產生聲音"),
    ("theremin", "Theremin in Musical Instrument Museum.jpg",
     "Theremin（1920）：兩根天線，手不碰樂器就能演奏"),
    ("ondes-martenot", "Ondes Martenot (1960).jpg",
     "Ondes Martenot（1928）：鍵盤加上一條可連續滑動的絲線"),
    ("trautonium", "Mixtur Trautonium.jpg",
     "Trautonium（1930）：按壓電阻絲控制音高，沒有固定音格"),
    ("hammond-b3", "Hammond B3 (2014-04-14 by jmorland at pixabay).jpg",
     "Hammond Organ（1935）：齒輪盤發聲，拉桿即時混合泛音"),
    ("moog-modular", "1973 Moog modular synthesizer.jpg",
     "Moog 模組化系統：每個模組一種功能，接線決定聲音"),
    ("buchla", "Buchla 100 series at NYU.jpg",
     "Buchla 100 系列：西岸哲學，觸控板與序列器取代鍵盤"),
    ("minimoog", "Minimoog @ Moogseum, NAMM 2010.jpg",
     "Minimoog（1970）：把模組化的接線固定下來，變成可以搬的樂器"),
    ("prophet-5", "Sequential Circuits Prophet 5.jpg",
     "Prophet-5（1978）：第一台能把音色存起來的複音合成器"),
    ("yamaha-dx7", "YAMAHA DX7.jpg",
     "Yamaha DX7（1983）：FM 合成，數位、複音、比類比機便宜"),
    ("fairlight-cmi", "Fairlight CMI-IIx.jpg",
     "Fairlight CMI（1979）：取樣器的起點，也是第一批數位音訊工作站"),
    ("roland-d50", "Roland D-50 Front (tweaked image).jpg",
     "Roland D-50（1987）：取樣的起音接上合成的延續音"),
    ("eurorack", "Eurorack Modular Synthesizer.jpg",
     "Eurorack：1996 年定下的規格，讓模組化在二十一世紀復活"),
]

LIC_RANK = {"public domain": 0, "cc0": 1, "cc by": 2, "cc-by": 2, "cc by-sa": 3}


def strip_html(h):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h or "")).strip()


def _open(req, timeout=40):
    """Commons 對連續請求會回 429,節流並退避重試。"""
    for attempt in range(5):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:
                time.sleep(3 * (attempt + 1))
                continue
            raise
    raise RuntimeError("重試耗盡")


def info(filename):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "titles": "File:" + filename,
        "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": "900"})
    req = urllib.request.Request(API + "?" + q, headers=UA)
    d = json.load(_open(req, 40))
    pages = (d.get("query") or {}).get("pages") or {}
    for v in pages.values():
        ii = (v.get("imageinfo") or [None])[0]
        if not ii:
            return None
        md = ii.get("extmetadata") or {}
        g = lambda k: (md.get(k) or {}).get("value", "")
        # API 會把小圖放大成 900px(糊掉)。原圖比 900 窄就直接取原檔。
        upscaled = (ii.get("width") or 0) < 900
        return {
            "url": (ii.get("url") if upscaled else (ii.get("thumburl") or ii.get("url"))),
            "w": ii.get("width") if upscaled else (ii.get("thumbwidth") or ii.get("width")),
            "h": ii.get("height") if upscaled else (ii.get("thumbheight") or ii.get("height")),
            "nat_w": ii.get("width"),
            "lic": g("LicenseShortName") or "(未標示)",
            "author": strip_html(g("Artist")) or "(未標示)",
            "page": ii.get("descriptionurl", ""),
        }
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for i, (slug, fname, caption) in enumerate(PICKS):
        if i:
            time.sleep(1.5)
        try:
            m = info(fname)
        except Exception as e:
            print("  ✗ %-16s 查詢失敗 %s" % (slug, e))
            continue
        if not m:
            print("  ✗ %-16s 找不到 %s" % (slug, fname))
            continue
        ext = ".jpg" if not fname.lower().endswith(".png") else ".png"
        dest = os.path.join(OUT, slug + ext)
        try:
            req = urllib.request.Request(m["url"], headers=UA)
            data = _open(req, 60).read()
            with open(dest, "wb") as f:
                f.write(data)
        except Exception as e:
            print("  ✗ %-16s 下載失敗 %s" % (slug, e))
            continue
        print("  ✓ %-16s %5d×%-4d %-16s %6d KB  %s"
              % (slug, m["w"], m["h"], m["lic"][:16], len(data) // 1024, m["author"][:26]))
        rows.append((slug, ext, fname, caption, m))

    # 授權標註
    lines = ["# 樂器照片的來源與授權", "",
             "第 3 章的樂器實拍照全部來自 [Wikimedia Commons](https://commons.wikimedia.org/)。",
             "下表列出每張照片的作者、授權條款與原始頁面。授權條款以原始頁面為準。", "",
             "重製或修改這些照片時，請遵守各自的授權要求（CC BY 系列需標示作者，",
             "CC BY-SA 系列另要求衍生作品採用相同授權）。", "",
             "| 檔案 | 樂器 | 作者 | 授權 | 原始頁面 |", "|---|---|---|---|---|"]
    for slug, ext, fname, caption, m in rows:
        name = caption.split("：")[0].split("（")[0]
        lines.append("| `%s%s` | %s | %s | %s | [Commons](%s) |"
                     % (slug, ext, name, m["author"], m["lic"], m["page"]))
    lines.append("")
    with open(os.path.join(OUT, "CREDITS.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("\n  授權標註寫入 images/instruments/CREDITS.md（%d 筆）" % len(rows))

    # 給後續插圖用的資料
    with open(os.path.join(OUT, "_manifest.json"), "w", encoding="utf-8") as f:
        json.dump([{"slug": s, "ext": e, "caption": c, "w": m["w"], "h": m["h"],
                    "lic": m["lic"], "author": m["author"]}
                   for s, e, _f, c, m in rows], f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
