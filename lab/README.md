# 聲音實驗室

在瀏覽器裡接一台模組化合成器。純前端（Web Audio API），沒有後端、不用登入、不收集任何資料。

**線上版**：<https://jinyaolin.github.io/SOUNDART/lab/>

## 這是什麼

`SOUNDART` 教材的線上練習場。第 3 章的 VCO → VCF → VCA、第 7 章的加法／減法／調變合成與延遲家族，都可以直接點開來聽，不必先裝 Pure Data。

節點：`osc` `noise` `filter` `vca` `adsr` `lfo` `delay` `keyboard` `seq` `out`

接線分三種，對應教材裡的觀念：

| 線 | 顏色 | 意義 |
|---|---|---|
| audio | 米白（粗） | 音訊訊號 |
| cv | 金色（虛線） | 控制電壓，接到參數上 |
| gate | 綠色（點線） | 觸發事件，驅動包絡 |

## 教材直達連結

| 章節 | 連結 |
|---|---|
| 3.4 電壓控制 | [`?preset=ch3-vcovcfvca`](./?preset=ch3-vcovcfvca) |
| 4.3 PSG 晶片與琶音和弦 | [`?preset=chiptune`](./?preset=chiptune) |
| 7.3 加法合成 | [`?preset=ch7-additive`](./?preset=ch7-additive) |
| 7.4 減法合成與 LFO | [`?preset=ch7-sub-lfo`](./?preset=ch7-sub-lfo) |
| 7.5 環形調變 | [`?preset=ch7-ringmod`](./?preset=ch7-ringmod) |
| 7.6 ADSR 包絡 | [`?preset=ch7-adsr`](./?preset=ch7-adsr) |
| 7.8 延遲家族 | [`?preset=ch7-delay`](./?preset=ch7-delay) |

## 檔案

| 檔 | 內容 |
|---|---|
| `engine.js` | 音訊引擎：節點定義（`NODE_DEFS`）、`PatchEngine`、patch 序列化 |
| `presets.js` | 範例 patch（前四個是原版，其餘是教材各節專用） |
| `app.js` | 介面：節點圖、接線、參數滑桿、音序器、示波器 |
| `index.html` | 版面與樣式 |

## patch 的兩種網址

- `?preset=<id>` — 載入內建範例，短、好寫進教材
- `#p=<base64>` — 任意 patch 的分享連結（按工具列的「分享連結」產生）

`#p=` 的格式與 `zaistudio.tw/labs/sound` 相同，兩邊的分享連結可以互通。

## 本機執行

```bash
python3 -m http.server 8000
# 開 http://localhost:8000/lab/
```

必須透過 http 開啟；直接雙擊 `index.html`（`file://`）會因為 ES module 的安全限制而載不到。

## 來源

引擎移植自 `zaistudio.tw/labs/sound`（同一位作者），邏輯相同、去掉 TypeScript 型別；介面因為靜態站不能跑 React／Next，改寫成原生 JavaScript。
