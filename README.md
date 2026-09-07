# SOUNDART — 聲音藝術與視覺化程式設計

一套中文的聲音藝術教材，從「聲音藝術是什麼」談到「用 Pure Data 與 Max/MSP 把聲音做出來」。

適合：想開始做聲音創作但沒有程式背景的人、藝術／設計科系的學生、想理解互動聲音裝置怎麼運作的創作者。

📊 **[線上投影片版本](https://jinyaolin.github.io/SOUNDART/)** — 同樣的內容，可以直接拿來上課或自學。

---

## 課程目錄

| # | 章節 | 內容 | 篇幅 |
|---|---|---|---|
| 1 | [前言：聲音藝術的世界](chapters/01-preface.md) | 定義與歷史、形式與類型、兩個工具的介紹 | 長 |
| 2 | [深入理解聲音藝術](chapters/02-understanding-sound-art.md) | 聲音的元素、創作過程、作品的解析與評價 | 短 |
| 3 | [Pure Data 入門](chapters/03-puredata-intro.md) | 歷史、視覺化程式語言、各版本比較與安裝 | 中 |
| 4 | [Pure Data 的物件](chapters/04-puredata-objects.md) | 訊號／音訊物件、hot & cold inlet、執行順序、UI 物件 | 中 |
| 5 | [Pure Data 聲音合成](chapters/05-puredata-synthesis.md) | 加法／減法／調變合成、包絡、取樣、延遲與殘響 | 長 |
| 6 | [Max/MSP 的使用](chapters/06-maxmsp.md) | 介面、數據處理、MSP 音訊、互動裝置、案例研究 | 長 |

---

## 建議的學習路徑

**只想知道聲音藝術是什麼** → 第 1、2 章。不需要碰任何軟體。

**想動手做，預算為零** → 第 1 章 → 第 3 章（裝 Pure Data）→ 第 4 章 → 第 5 章。
Pure Data 完全免費、跨平台，是學合成原理最直接的路。第 5 章做完，你會有一台自己的合成器。

**目標是展場裝置 / 劇場 / 接感測器** → 上面走完之後接第 6 章。
Max/MSP 在接硬體、影像（Jitter）與 Ableton 整合上遠比 Pd 成熟，但原理是共通的——第 6.7 節有兩者的完整對照表。

**已經會 Max，想學 Pd**（或反過來） → 直接看 [6.7 對照表](chapters/06-maxmsp.md#67-給-pure-data-使用者的對照表)，再挑不熟的節看。

---

## 軟體怎麼取得

| 軟體 | 授權 | 下載 |
|---|---|---|
| **Pure Data (Vanilla)** | 免費、開源 | <https://puredata.info/downloads/pure-data> |
| **PlugData** | 免費、開源 | <https://plugdata.org> — Pd 的現代化介面，初學者推薦 |
| **Max/MSP** | 商業（30 天試用、教育版較便宜） | <https://cycling74.com/downloads> |

第 3 章有各版本的詳細比較（Vanilla / Pd-extended / Purr Data / MobMuPlat / PlugData）。

---

## 尚未撰寫的章節

這份教材還在長。原始大綱裡規劃、但目前還沒寫的部分：

- **Pure Data 的互動裝置與案例研究**（對應 Max 的 6.5、6.6 兩節）
- **第 7 章 兩個工具的比較與應用** — 目前濃縮在 [6.7 節](chapters/06-maxmsp.md#67-給-pure-data-使用者的對照表)
- **第 8 章 結論** — 未來趨勢、延伸閱讀與學習資源

---

## 檔案結構

```
SOUNDART/
├── README.md              本頁：課程總覽與目錄
├── index.html             線上投影片的首頁（GitHub Pages）
├── chapters/              教材本文（Markdown）
│   ├── 01-preface.md
│   ├── 02-understanding-sound-art.md
│   ├── 03-puredata-intro.md
│   ├── 04-puredata-objects.md
│   ├── 05-puredata-synthesis.md
│   └── 06-maxmsp.md
├── slides/                投影片
│   ├── index.html         reveal.js 播放器
│   └── *.md               各章投影片內容
└── images/                所有圖片
```

> **舊檔名對照**（2026 年整理結構時改的）：
> `1.md` → `chapters/01-preface.md`ᅟ|ᅟ`2.md` → `02-understanding-sound-art.md`ᅟ|ᅟ`3.md` → `03-puredata-intro.md`ᅟ|ᅟ`3.1.md` → `04-puredata-objects.md`ᅟ|ᅟ`3.2.md` → `05-puredata-synthesis.md`ᅟ|ᅟ`4.md` → `06-maxmsp.md`

---

## 投影片怎麼用

線上版直接開 <https://jinyaolin.github.io/SOUNDART/> 就好。

**本機預覽**（改完想先看效果再推上去）：

```bash
cd SOUNDART
python3 -m http.server 8000
# 瀏覽器開 http://localhost:8000
```

> 投影片必須透過 http 開啟，直接雙擊 `index.html`（`file://`）會因為瀏覽器的安全限制而載不到內容。

**操作方式**：

| 動作 | 按鍵 |
|---|---|
| 下一頁 / 上一頁 | `→` `←` 或空白鍵 |
| 全部投影片總覽 | `Esc` 或 `O` |
| 講者備忘稿（另開視窗） | `S` |
| 全螢幕 | `F` |
| 匯出 PDF | 網址後面加 `?print-pdf`，然後用瀏覽器列印 |

手機與平板可以直接滑動翻頁。

**要改投影片內容**：編輯 `slides/` 裡對應的 `.md` 檔就好，不用碰 HTML。`---`（三個減號獨立一行）分隔左右頁，`--`（兩個減號）分隔上下頁，`Note:` 之後的內容是只有講者看得到的備忘稿。

---

## 授權

教材文字與圖片版權為作者所有。程式碼範例（補丁片段）可自由使用。
