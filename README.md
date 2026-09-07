# SOUNDART — 聲音藝術與視覺化程式設計

一套中文的聲音藝術教材，從「聲音藝術是什麼」談到「用 Pure Data 與 Max/MSP 把聲音做出來」。

適合：想開始做聲音創作但沒有程式背景的人、藝術／設計科系的學生、想理解互動聲音裝置怎麼運作的創作者。

📊 **[線上投影片版本](https://jinyaolin.github.io/SOUNDART/)** — 同樣的內容，可以直接拿來上課或自學。

---

## 課程目錄

| # | 章節 | 內容 | 篇幅 |
|---|---|---|---|
| | **第一部分　脈絡：為什麼** | | |
| 1 | [前言：聲音藝術的世界](chapters/01-preface.md) | 定義與歷史、形式與類型、兩個工具的介紹 | 長 |
| 2 | [深入理解聲音藝術](chapters/02-understanding-sound-art.md) | 聲音的元素、創作過程、作品的解析與評價 | 短 |
| 3 | [電子合成樂器的歷史與技術](chapters/03-synthesizers.md) | 電壓控制、五種合成法、MIDI 與標準、介面的歷史 | 長 |
| 4 | [電子遊戲音樂的歷史](chapters/04-game-audio.md) | 從電路發聲到程序音訊、iMUSE、libpd 與產業接點 | 長 |
| | **第二部分　動手：怎麼做** | | |
| 5 | [Pure Data 入門](chapters/05-puredata-intro.md) | 歷史、視覺化程式語言、各版本比較與安裝 | 中 |
| 6 | [Pure Data 的物件](chapters/06-puredata-objects.md) | 訊號／音訊物件、hot & cold inlet、執行順序、UI 物件 | 中 |
| 7 | [Pure Data 聲音合成](chapters/07-puredata-synthesis.md) | 加法／減法／調變合成、包絡、取樣、延遲與殘響 | 長 |
| 8 | [Max/MSP 的使用](chapters/08-maxmsp.md) | 介面、數據處理、MSP 音訊、互動裝置、案例研究 | 長 |
| | **第三部分　收束** | | |
| 9 | [兩個工具的比較與選擇](chapters/09-comparison.md) | 逐項比較、五個真實情境、什麼時候該離開這兩個工具 | 中 |
| 10 | [結論與學習資源](chapters/10-conclusion.md) | 三條線的回顧、未來趨勢、書單與下一步 | 中 |

---

## 建議的學習路徑

**只想知道聲音藝術是什麼** → 第 1、2 章。不需要碰任何軟體。

**想理解電子聲音是怎麼來的** → 第 1、2 章 → 第 3 章（樂器史）→ 第 4 章（遊戲音樂）。
這四章是完整的「脈絡篇」，一樣不需要打開任何軟體。

**想動手做，預算為零** → 第 1 章 → 第 5 章（裝 Pure Data）→ 第 6 章 → 第 7 章。
Pure Data 完全免費、跨平台，是學合成原理最直接的路。第 7 章做完，你會有一台自己的合成器。

**目標是展場裝置 / 劇場 / 接感測器** → 上面走完之後接第 8 章。
Max/MSP 在接硬體、影像（Jitter）與 Ableton 整合上遠比 Pd 成熟，但原理是共通的。

**對遊戲音訊有興趣** → 第 1、2 章 → 第 5～7 章（Pure Data）→ 回頭讀第 4 章。
第 4 章結尾的 libpd 是把補丁變成遊戲聲音引擎的路。

**不知道該用 Pd 還是 Max** → 直接看[第 9 章](chapters/09-comparison.md)。

**一學期的課怎麼排** → 見 [10.5 節](chapters/10-conclusion.md)。

---

## 軟體怎麼取得

| 軟體 | 授權 | 下載 |
|---|---|---|
| **Pure Data (Vanilla)** | 免費、開源 | <https://puredata.info/downloads/pure-data> |
| **PlugData** | 免費、開源 | <https://plugdata.org> — Pd 的現代化介面，初學者推薦 |
| **Max/MSP** | 商業（30 天試用、教育版較便宜） | <https://cycling74.com/downloads> |

第 3 章有各版本的詳細比較（Vanilla / Pd-extended / Purr Data / MobMuPlat / PlugData）。

---

## 內容狀態

十章全部完成。教材持續增修——錯誤回報與建議歡迎開 issue。

> 一個已知的小瑕疵：第 5 章（Pure Data 入門）沿用原始的區域編號（1.、2.、3.），
> 與其他章的「章.節」編號不一致。內容不影響閱讀，之後會統一。

---

## 檔案結構

```
SOUNDART/
├── README.md              本頁：課程總覽與目錄
├── index.html             線上投影片的首頁（GitHub Pages）
├── chapters/              教材本文（Markdown）
│   ├── 01-preface.md
│   ├── 02-understanding-sound-art.md
│   ├── 03-synthesizers.md
│   ├── 04-game-audio.md
│   ├── 05-puredata-intro.md
│   ├── 06-puredata-objects.md
│   ├── 07-puredata-synthesis.md
│   ├── 08-maxmsp.md
│   ├── 09-comparison.md
│   └── 10-conclusion.md
├── slides/                投影片（reveal.js 播放器 + 各章 markdown）
└── images/                所有圖片
```

> **舊檔名對照**（2026 年兩次整理的結果）：
> 最初的 `1.md`～`4.md` 已改為 `chapters/NN-名稱.md`；2026-09 又依「脈絡→動手→收束」重排順序，
> 把兩個歷史章移到前面。若你有舊連結：
> `03-puredata-intro` → `05-puredata-intro`ᅟ|ᅟ`04-puredata-objects` → `06-puredata-objects`ᅟ|ᅟ
> `05-puredata-synthesis` → `07-puredata-synthesis`ᅟ|ᅟ`06-maxmsp` → `08-maxmsp`ᅟ|ᅟ
> `07-game-audio` → `04-game-audio`ᅟ|ᅟ`08-synthesizers` → `03-synthesizers`

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
