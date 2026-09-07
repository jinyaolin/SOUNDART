<!-- .slide: class="title" -->
# Max/MSP

## 介面、數據、音訊、互動裝置

第 6 章

Note:
如果前面 Pd 學得紮實，這一章有八成是「換名字」。真正新的東西是 6.5 的互動與 Jitter。

---

## Max 的三個基本單位

| | 按鍵 | 是什麼 |
|---|---|---|
| **物件** Object | `n` | 會做事的東西（動詞） |
| **訊息** Message | `m` | 被存起來的一句話（名詞） |
| **註解** Comment | `c` | 給三個月後的自己看 |

加上**連接線**，就是 Max 的全部文法。

<p class="vidlinks">▶ <a href="https://www.youtube.com/playlist?list=PLasl9I6VeCCqdfQpjZwV-rjIXQS3OnoDe">Cycling '74 官方「Getting Started with Max」</a></p>

---

## 物件

```
[metro 500]
  ↑     ↑
物件名  引數
```

- **物件名**決定它是什麼
- **引數**是初始設定值，執行中通常可以從 inlet 改掉

**inlet / outlet 的規則與 Pd 完全相同**：
最左邊是 hot inlet（觸發），其他是 cold inlet（只儲存）。

> **Max 比 Pd 友善的地方**：滑鼠停在 inlet 上會跳出提示；
> 按住 Option/Alt 點物件會打開**說明檔**——每個說明檔本身就是可以直接玩的範例補丁。

---

## 訊息盒的進階寫法

| 寫法 | 意義 |
|---|---|
| `[440(` | 送出數字 |
| `[1 2 3(` | 送出 list |
| `[open(` | 送出指令（symbol） |
| `[set 440(` | **只設定不觸發** |
| `[$1(` | 變數，替換成收到的值 |
| `[frequency $1(` | 收到 440 → 送出 `frequency 440` |
| `[; dsp start(` | 分號 = 送到全域接收者 |

> **`$1` 是訊息盒最重要的功能**——把使用者操作轉成物件指令的橋梁。

---

## 三種模式

| 模式 | 快捷鍵 | 你在做什麼 |
|---|---|---|
| 編輯 Patching | Cmd/Ctrl + E | 蓋房子：接物件、拉線 |
| 鎖定 Locked | Cmd/Ctrl + E | 住房子：按按鈕、聽聲音 |
| 演示 Presentation | Cmd+Opt+E / Ctrl+Alt+E | 給別人看：只顯示挑過的 UI |

> 左下角的鎖頭圖示告訴你現在在哪個模式。
> 演示模式要先在右鍵選單勾 **Add to Presentation**，物件才會出現。

---

## 別讓補丁變成義大利麵

- **`[p 名稱]`** 子補丁 — 把一整段功能收進一個盒子，雙擊打開
- **`[s]` / `[r]`** — 無線傳輸訊息，不用拉線。音訊版是 `[send~]` / `[receive~]`
- **註解** — 三個月後你會非常感謝當初寫的那幾行字
- **對齊** — 線接得整齊不是強迫症，是**除錯速度**

> **抽象（Abstraction）**：獨立的 `.maxpat` 檔，放在搜尋路徑就能像內建物件一樣叫出來、可傳引數、可重複使用。做到第三個專案時你會需要它。

---

## 數據：五種基本 atom

| 型別 | 例 |
|---|---|
| **int** | `42` |
| **float** | `3.14` |
| **symbol** | `open` |
| **list** | `1 2 3` |
| **bang** | 「現在做」 |

外加只在 MSP 之間流動的 **signal**（粗線）。

> **bang 不是資料，是時間。** 所有「什麼時候發生」的邏輯都由它驅動。

---

## 最常用的幾個運算物件

```plaintext
[+ 5] [- 5] [* 2] [/ 2] [% 12]
[expr $i1 * sin($f2)]
[scale 0 127 20. 20000.]     <- 範圍映射
[random 100]
[mtof] [ftom]                <- MIDI 音高 ⇄ 頻率
```

**`[scale]` 是出場率最高的物件**：所有「把感測器讀數變成有用參數」的工作都是它在做。

**`[mtof]`** 則是連接「音樂世界」與「聲學世界」的翻譯官。

---

## 執行順序：右到左

> ### 一個 outlet 接多個目標時，Max 一定從最右邊開始執行。

而且「右」是看**物件在畫面上的位置**，不是接線順序。

**把物件拖到旁邊，程式行為就變了。**

解法只有一個：

```plaintext
[t b b b]     <- 明確指定順序（右→中→左）
```

> 只要一個 outlet 要接到兩個以上的地方，就插一個 `[t]`。

---

## 資料結構

| 物件 | 存什麼 | 場合 |
|---|---|---|
| `[coll]` | 編號／命名的資料列 | 樂句、和弦表、參數組 |
| `[dict]` | 巢狀鍵值（=JSON） | 結構化設定、網路 API |
| `[table]` | 一維整數陣列，可畫 | 音階、機率分佈、曲線 |
| `[buffer~]` | **音訊**取樣資料 | 音檔、錄音、波表 |
| `[zl]` | list 的瑞士刀 | 排序、切割、反轉、取長 |
| `[pattr]` | 補丁參數狀態 | preset、快照 |

> 處理 list 時先想「`[zl]` 有沒有現成的模式」，通常有：
> `[zl len]` `[zl rev]` `[zl sort]` `[zl slice 3]` `[zl group 4]` `[zl nth 2]`

---

## 控制結構

**條件**
`[sel 60]` 相符就 bang · `[route note ctl]` 依開頭分流 · `[if $i1 > 64 then bang]` · `[gate]` 閘門

> `[sel]` 輸出 **bang**（在意「是不是」）
> `[route]` 輸出**剩下的資料**（在意「內容是什麼」）

**迴圈**
`[uzi 16]` — 收到一個 bang，**瞬間**送出 16 個 bang，中間 outlet 給你計數值

> ⚠️ `[uzi]` 是同一瞬間跑完的。要「每隔一段時間做一次」得用 `[metro]`。

--

## 時間

```plaintext
[metro 500]        <- 每 500 ms 一個 bang
[delay 1000]       <- 收到 bang 等 1000 ms 再送
[counter 0 7]      <- 0,1,2...7,0,1... 循環
[transport]        <- 用小節/拍而非毫秒
[speedlim 50]      <- 限速，避免 UI 被灌爆
```

典型的「跑八個音」：

```plaintext
[tgl] → [metro 250] → [counter 0 7] → [coll myScale] → [mtof] → [cycle~ ]
```

---

## MSP：訊號的世界

| | 訊息 Max | 訊號 MSP |
|---|---|---|
| 線 | 細黑線 | **粗黃黑條紋線** |
| 命名 | `[cycle]` | `[cycle~]` |
| 何時運作 | 有事件才動 | DSP 開著就持續 |
| 範圍 | 任意 | 音訊慣例 **−1 ～ 1** |

> `~` 代表音訊——這個約定是 Puckette 從 Max 帶到 Pd 的，**兩邊完全一致**。

**要有聲音**：點 `[ezdac~]` 本身，或送 `[startwindow(` 給 `[dac~]`。

---

## 音源

| 物件 | 波形 |
|---|---|
| `[cycle~ 440]` | 正弦（讀 512 點波表） |
| `[saw~]` `[rect~]` `[tri~]` | 鋸齒／方波／三角（**限頻**，無疊頻雜訊） |
| `[phasor~]` | 0～1 斜坡，**不是拿來聽的** |
| `[noise~]` `[pink~]` | 白噪音／粉紅噪音 |

> **核心心法**：`[cycle~]` 產生「聽得到的東西」，
> `[phasor~]` 產生「掃過去的位置」——接到 `[wave~]`、`[groove~]`、`[index~]` 上讀任何東西。

---

## 最小發聲補丁

```plaintext
[cycle~ 440]
     |
[*~ 0.1]        <- 沒給引數的 [*~] 預設是 0，等於靜音
     |
[ezdac~ ]       <- 帶開關的音訊輸出
```

---

## 包絡：Max 比 Pd 方便的地方

| 物件 | 用途 |
|---|---|
| `[line~]` | 線性斜坡，送 `[1 10(` |
| `[curve~]` | 指數曲線，聽感更自然 |
| `[adsr~ 5 100 0.6 400]` | **直接給你完整 ADSR** |
| `[function]` | 用滑鼠**畫**包絡的 UI |

> Pd 要自己用 `[vline~]` 拼包絡，Max 直接給一個物件。
> 為什麼需要包絡（click 的成因）見第 5 章。

---

## 濾波

```plaintext
[lores~ 1000 0.6]    <- 低通 + 共振（接近 1 會嘯叫）
[onepole~ 500]       <- 最單純的一階低通，常用來平滑控制訊號
[reson~ 1 800 20]    <- 帶通共振器
[svf~ 800 0.5]       <- 四種輸出同時給你
[biquad~]            <- 通用二階，配 [filtergraph~]
```

> **`[filtergraph~]` + `[biquad~]` 是 Max 的招牌體驗**：
> 在圖上拖曳曲線，係數自動算好送進濾波器。

---

## 一台減法合成器

```plaintext
[kslider]                      <- 螢幕鍵盤
    |
[t i i]
    |        |
[mtof]   [adsr~ 5 200 0.7 500]
    |        |
[saw~ ]      |                 <- 泛音豐富的音源
    |        |
[lores~ 1200 0.7]              <- 決定音色
    |        |
[*~ ]--------+                 <- 包絡控制音量
    |
[*~ 0.2] ── [ezdac~ ]
```

> 進階：把包絡**同時**送去控制 `[lores~]` 的截止頻率（經 `[scale]` 映射到 300～4000 Hz）。
> 「一按下去先亮後暗」是類比合成器最有辨識度的聲音特徵。

---

## 取樣與延遲

**取樣**
`[buffer~]` 記憶體 · `[groove~]` 可變速循環播放 · `[play~]` · `[record~]` · `[wave~]` 波表 · `[waveform~]` 波形 UI

> `[groove~]`：送 1 = 原速、0.5 = 半速（低八度）、−1 = 倒放

**延遲**
```plaintext
[tapin~ 2000] → [tapout~ 375] → [*~ 0.6] → 接回 [tapin~]
```

> 等同 Pd 的 `[delwrite~]` / `[delread~]`。
> 延遲時間長短決定它是梳狀／鑲邊／合唱／回聲——對照表見第 5 章，兩邊通用。

---

## 幾個值得知道的

- **`[poly~]`** — 複音。把單一聲部做成獨立補丁，`[poly~ myvoice 16]` 一次開 16 份
- **`[pfft~]`** — 頻域處理。vocoder、頻譜凍結、時間伸縮
- **`[mc.]` 前綴** — Max 8 的多聲道包裝。`[mc.cycle~ 64]` 一個物件 = 64 個振盪器
- **`[gen~]`** — 寫**逐取樣點**的運算（一般 MSP 是逐 block）
- **RNBO** — 把補丁**匯出成 VST 外掛、網頁 JS、或燒進 Raspberry Pi**

> RNBO 解決了 Max 長年的痛點：**作品不用再綁在 Max 上執行。**

<p class="vidlinks">▶ <a href="https://www.youtube.com/watch?v=Aqq6fUUq1Fc">Cycling '74：Welcome to RNBO</a></p>

---

## Max 真正的強項

不是合成聲音（Pd 也能做），而是**把各種東西接在一起**。

| 來源 | 物件 |
|---|---|
| 鍵盤／滑鼠 | `[key]` `[mousestate]` |
| MIDI 控制器 | `[notein]` `[ctlin]` |
| Arduino／感測器 | `[serial]` |
| 網路 / OSC | `[udpreceive]` + `[route]` |
| 麥克風 | `[adc~]` |
| 攝影機 | `[jit.grab]` |
| 平板 | `[mira.frame]` |

--

## 接手機（OSC）

```plaintext
[udpreceive 8000]              <- 監聽 8000 埠
        |
[route /fader1 /fader2]        <- 依 OSC 位址分流
        |
[scale 0. 1. 200. 2000.]       <- 映射到有用的範圍
        |
   （去控制濾波器）
```

--

## 接 Arduino

```plaintext
[metro 20] → [serial a 9600] → [zl group 3] → [scale 0 1023 0. 1.]
```

> **裝置藝術的實務建議**：感測器的原始讀數幾乎都是抖的。
> 在 `[scale]` 之後接 `[onepole~]` 或 `[slide]` 做平滑，質感會立刻不一樣。
>
> **「把數值變順」往往比「接得上」更決定作品好不好。**

---

## Jitter：影像與 3D

物件都以 `jit.` 開頭，處理的是**矩陣**——一張影像就是一個二維矩陣。

**聲音藝術家最常做的兩件事：**

**影像 → 聲音**
`[jit.grab]` 抓攝影機 → 比較連續影格的差異 → `[jit.3m]` 變成一個數字 → 控制音量或濾波器
＝ 最經典的「**觀眾一動，聲音就變**」

**聲音 → 影像**
`[peakamp~]` 或 `[fft~]` 分析聲音 → 驅動 3D 物件的大小、顏色、變形

<p class="vidlinks">▶ <a href="https://www.youtube.com/watch?v=VXTxZUsFIuY">Cycling '74：用 Jitter 播放影片</a><span class="sep">·</span><a href="https://www.youtube.com/watch?v=MS0Ratnr95o">Jitter 入門課：Vizzie 影像處理</a></p>

---

## Max for Live

2009 年 Cycling '74 與 Ableton 合作，讓 Max 補丁**直接變成 Live 裡的裝置**。

- 掛在音軌上，和一般效果器、樂器一樣使用
- `[live.*]` UI 物件，外觀與 Live 一致
- 可讀寫 Live 本身的資料（音軌、片段、音符）

> 意義：**實驗性的想法可以直接進入正規的音樂製作流程。**
> Max 的使用者數量在 2010 年後大幅成長，很大一部分來自這裡。

<p class="vidlinks">▶ <a href="https://www.youtube.com/watch?v=Ahs9g46rWbw">Max for Live 總覽</a></p>

---

## 案例研究：先問四個問題

分析任何互動聲音作品：

1. **輸入是什麼？**
2. **映射怎麼設計的？** ← 最能看出功力的一層
3. **聲音本身怎麼產生？**
4. **為什麼要即時？** ← 答不出來，互動可能只是裝飾

--

## Manoury《Jupiter》(1987)

長笛 + 即時電子。在 **IRCAM** 以 4X 工作站完成——**這正是 Max 誕生的現場**。

技術核心是 **score following（樂譜追蹤）**：電腦「聽」現場演奏，判斷走到樂譜哪一個音，在正確時間點觸發電子聲響。

- **輸入**：麥克風收到的長笛聲 → 音高偵測
- **映射**：音符序列 → 與預存樂譜比對 → 決定位置 → 觸發事件
- **為什麼要即時**：演奏者可以自由呼吸、伸縮速度，電子聲部**跟著走**

> 這確立了「樂器 + 即時電子」整個作品類型的技術模型。

<p class="vidlinks">▶ <a href="https://www.youtube.com/watch?v=q8varyj7B1k">Manoury《Jupiter》</a><span class="sep">·</span><a href="https://www.youtube.com/watch?v=q55Okme1vTc">IRCAM 樂譜追蹤示範</a></p>

--

## Rokeby《Very Nervous System》(1982–91)

早於 Max 普及（自製硬體軟體），但它是**所有影像互動聲音裝置的原型**。

攝影機拍攝觀眾，偵測影像變化量，把身體動作轉成聲音。

- **輸入**：攝影機（用 Max 重建就是 `[jit.grab]`）
- **映射**：影格差異 → 動作量與位置 → 音高、密度、音色
- **值得學的**：它刻意讓映射**不完全可預測**

> 一對一的死板對應，人五分鐘就玩膩；留一點模糊與延遲，人反而會待上半小時。
> **可預測性與吸引力常常是反比。**

<p class="vidlinks">▶ <a href="https://www.youtube.com/watch?v=SrawKucSSRw">Very Nervous System (1986–90)</a></p>

--

## Autechre 的生成式現場

英國電子雙人組長期以 Max/MSP 建構自己的演出系統。

不是用 Max 播放做好的曲子，而是**寫一套會自己產生音樂的系統，現場讓它跑**。演出者更接近「調整參數的園丁」。

> **把工具本身當成作品的一部分**：補丁不是達成某個聲音的手段，
> 補丁就是樂器、就是樂譜、就是作曲家。

<p class="vidlinks">▶ <a href="https://www.youtube.com/watch?v=ev3vENli7wQ">Autechre《Gantz Graf》官方 MV</a></p>

---

## 給 Pd 使用者的對照表

| | Pure Data | Max/MSP |
|---|---|---|
| 授權 | 免費開源 | 商業（30 天試用） |
| 正弦 | `[osc~]` | `[cycle~]` |
| 延遲 | `[delwrite~]`/`[delread~]` | `[tapin~]`/`[tapout~]` |
| 包絡 | `[vline~]` 自己拼 | `[adsr~]`、`[function]` |
| 取樣 | array + `[tabread4~]` | `[buffer~]` + `[groove~]` |
| 新增物件 | 雙擊 | 按 `n` |
| 影像 | GEM（外掛） | Jitter（內建、成熟） |
| 嵌入 | **libpd → App／遊戲／手機** | RNBO 匯出 |

--

## 不是二選一

很多人的實際狀態是：

- **用 Pd** 學原理、做嵌入式的東西、預算為零時
- **用 Max** 做展場裝置、接硬體與影像、與 Ableton 整合

> 原理是共通的——`~` 是訊號、hot inlet 觸發、右到左執行、訊號自動相加。
> **學會一個，另一個只是查對照表。**

---

## 練習

1. **鍵盤發聲器** — `[kslider]` → `[mtof]` → `[cycle~]` → `[adsr~]` → `[ezdac~]`
2. **滑鼠濾波器** — `[mousestate]` 的 Y 經 `[scale]` 控制 `[lores~]`
3. **八音循環** — `[metro]` + `[counter]` + `[coll]`
4. **加上人味** — 音高加一點 `[random]`、時間加一點 `[drunk]`。比較「完全準確」和「有點不準」哪個好聽
5. **接實體輸入** — MIDI 控制器或 Arduino 的電位器
6. **影像互動** — `[jit.grab]` + `[jit.3m]` 把動作量變成音量

---

## 本章重點

1. **物件、訊息、補丁** + hot/cold + **右到左**
2. **`[t]`** — 一分為二就插一個
3. **`~` 的分界** — `[scale]`、`[line~]`、`[snapshot~]` 是兩個世界之間的橋
4. **映射才是創作**

> Max 陡的地方不在物件難學，而在於**它幾乎什麼都能做，
> 所以你必須先知道自己要做什麼。**

---

<!-- .slide: class="title" -->
## 全部章節結束

技術給完了。剩下的是——

**你想讓觀眾聽見什麼、感覺到什麼。**
