---
name: Carrel 座位預約
description: 大學圖書館自習座位預約。座位在建築平面圖上直接選。
colors:
  college-navy: "#1B2A47"
  college-navy-deep: "#142036"
  on-navy: "#FFFFFF"
  on-navy-muted: "#B9C4D8"
  plan-ink: "#33415C"
  stone: "#EEF1F4"
  paper: "#FFFFFF"
  rule: "#D5DBE3"
  text: "#18202E"
  text-muted: "#556076"
  college-green: "#1E6B4F"
  college-green-deep: "#165540"
  green-tint: "#E3F0EA"
  booked-fill: "#E6E9EE"
  booked-hatch: "#9AA3B2"
  warn: "#8A5300"
  warn-tint: "#FFF3DC"
  danger: "#B23A2B"
  danger-tint: "#FBE8E5"
  danger-deep: "#962F22"
  danger-border: "#E3B4AD"
  navy-hover: "#24365A"
  navy-hover-light: "#E6ECF5"
  rule-strong: "#B8C1CE"
  points-amber: "#F2B544"
  disabled-text: "#6B7488"
  booked-text: "#7D879A"
  plan-mini-line: "#A9B2C1"
  surface-muted: "#F5F6F8"
  surface-closed: "#F7F8FA"
  slot-selected: "#F6FBF8"
  demo-strip: "#FDF6E3"
  demo-strip-border: "#F0E0B8"
typography:
  hero:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.3
  display:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  display-sm:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  headline-lg:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.25
  title-lg:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  title-md:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.35
  title:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
  body-sm:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
  micro:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
  plan-label:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
  plan-room:
    fontFamily: "Public Sans, Noto Sans TC, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.08em"
  numeral:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  xs: "2px"
  pip: "3px"
  sm: "4px"
  seg: "6px"
  md: "8px"
  lg: "12px"
  sheet-top: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.college-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.college-green-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.college-navy}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "44px"
  sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "24px"
  chip-filter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: "36px"
  chip-filter-on:
    backgroundColor: "{colors.college-navy}"
    textColor: "{colors.on-navy}"
  shell:
    backgroundColor: "{colors.college-navy}"
    textColor: "{colors.on-navy}"
---

# Design System: Carrel 座位預約

## Overview

**Creative North Star: "The Reading-Room Plan"（閱覽室平面圖）**

靈感來自國外大學圖書館的預約系統與館內圖面：Cambridge Spacefinder 的「依需求找空間」、LibCal 系列清楚的時段可用狀態，以及 Bodleian、Cambridge UL 這類老圖書館掛在牆上的樓層指引與閱覽室平面圖。我們把這些元素轉成一個學生每天會用的工具：外框是學院深藍，內容是一張張白紙，選位直接在建築平面圖上進行。

這是 Operate 介面，學生是來辦事的。導覽、按鈕、分頁、輸入框都用大家熟悉的網頁元件。視覺個性只出現在四個地方：字體、配色、資訊密度，以及一個招牌設計：用建築製圖畫的座位圖。

**Key Characteristics:**
- 深藍學院色外框（電腦版側欄、手機版頂欄）＋冷灰石色底＋白紙內容區。
- 座位圖照建築製圖慣例畫：粗牆、雙線窗、門的開啟弧線、斜線書架。
- 已預約座位用製圖的斜線影線表示，不只靠顏色，色覺差異使用者也看得懂。
- 時間與座位編號一律用等寬數字（tabular numerals）。
- 一個主色（學院綠）代表「可以做」：可預約、主要按鈕、我的座位。

## Colors

色彩策略為 **Restrained + 實際功能**：深藍負責外框與架構，學院綠負責「可行動」，狀態色只在有意義時出現。

### Primary
- **College Navy 學院深藍** (#1B2A47)：側欄、手機頂欄、樓層指引的目前樓層、選取中的篩選 chip。給人機構、可信任的感覺。
- **College Green 學院綠** (#1E6B4F)：可預約、主要按鈕、我選的座位、成功狀態。

### Neutral
- **Stone 石灰底** (#EEF1F4)：頁面底色。冷調，不用奶油色。
- **Paper 白紙** (#FFFFFF)：內容卡片與平面圖圖紙。
- **Plan Ink 製圖墨** (#33415C)：平面圖的牆、桌子線條。
- **Rule 分隔線** (#D5DBE3)：細框與分隔。
- **Text / Text Muted** (#18202E / #556076)：主要文字與輔助文字。在石灰底與白紙上都通過 AA。
- **Disabled Text** (#6B7488) on **Surface Muted** (#F5F6F8)：停用的時段卡與按鈕。
- **Points Amber** (#F2B544)：只用在深藍外框上的違規點數小格。在白底上，違規點數改用磚紅色。
- **Booked Fill / Hatch** (#E6E9EE / #9AA3B2)：已被預約座位的底色與斜線。

### State
- **Warn 琥珀** (#8A5300 on #FFF3DC)：報到倒數、接近違規上限。
- **Danger 磚紅** (#B23A2B on #FBE8E5)：未報到、停權、錯誤。

### Named Rules
**The Hatching Rule（影線規則）。** 座位狀態一定要同時用形狀或紋理和文字表示：可預約＝空心桌、已預約＝斜線、我的＝實心綠＋勾、不可用＝虛線＋叉。
**The One Green Rule（單一綠色規則）。** 綠色只代表「可以做／已屬於你」，不拿來裝飾。

## Typography

**Body / UI:** Public Sans（拉丁字母與數字），Noto Sans TC（中文）。Public Sans 是美國政府的開源公共服務字體，正好呼應公共機構工具的氣質。

- **Display**（1.75rem / 700）：頁面主標，例如「選擇座位」。
- **Headline**（1.25rem / 700）：區塊標題。
- **Title**（1rem / 600）：卡片標題、座位編號。
- **Body**（0.9375rem / 400 / 1.6）：說明文字，行寬不超過 70 字元。
- **Label**（0.8125rem / 600）：欄位標籤、圖例、狀態標籤。
- **Numeral**：時間、日期、座位編號、剩餘數量都開啟 `tnum`，數字才會對齊。

**The No Eyebrow Rule.** 標題上方不加小字標籤，標題自己就要說清楚。

## Layout

- **電腦版（≥ 960px）**：左側 248px 深藍側欄（Logo、三個主要導覽、底部個人與違規點數），右側內容最寬 1200px。
- **手機版（< 960px）**：深藍頂欄＋白色底部分頁列（預約／我的預約／我的），觸控目標至少 44px。
- **選位頁**：電腦版是三欄（樓層指引 220px｜平面圖｜選取資訊 300px）；手機版依序是樓層分頁、篩選、可左右滑動的平面圖，選取資訊固定在底部。
- **間距**：以 4px 為基礎，用 8／16／24／40。標題上方的空間比下方大。

## Elevation & Depth

以色塊分層為主（深藍外框 → 石灰底 → 白紙），陰影只用在兩個地方：白紙卡片的柔和陰影（0 1px 2px + 0 4px 12px，低透明度），以及手機版底部的選取資訊面板。

## Shapes

- 卡片與面板 12px 圓角；按鈕、輸入框 8px；chip 與平面圖上的桌子 4px 以內，保留製圖的方正感。
- 平面圖線條：外牆 6px、內部隔間 2px、家具 1.5px，全部用製圖墨色。

## Components

- **Seat（座位）**：桌子矩形＋椅子半圓。可預約＝白底墨線，hover／focus 時轉成綠色淡底；已預約＝斜線影線；我的＝實心綠＋白勾；不可用＝虛線＋叉；被篩選掉的座位降到 30% 透明度。插座與無障礙用小圖示標在桌角。
- **Floor Directory（樓層指引）**：像館內的牆面指標，由上而下排 4F、3F、2F，每層列出大寫樓層號、區域名稱與剩餘座位數。目前樓層以深藍底標示。
- **Slot Card（時段卡）**：時段名稱、時間（等寬數字）、剩餘座位數；狀態有可選、已選、已額滿、已結束、已預約。
- **Booking Sheet（預約卡）**：日期時段、樓層座位、狀態標籤、依時間變化的操作（報到／取消），附一張縮小平面圖標出座位位置。
- **Buttons**：主要按鈕是綠底白字，次要按鈕是白底深藍字加細框，危險操作用磚紅字。
- **Focus**：所有可互動元素都有 2px 深藍外框＋2px 白色間隔的 focus ring。

## Do's and Don'ts

- **Do** 讓座位圖看起來像真的建築圖：牆、窗、門、書架都要有。
- **Do** 在使用者做決定的時刻（確認、取消）才顯示規則與點數。
- **Don't** 只用顏色區分座位狀態。
- **Don't** 用漸層、玻璃擬態、彩色粗左框卡片或 emoji 當圖示。
- **Don't** 用奶油色底或襯線大標去營造「書香」，這是 AI 預設的書店風，不是圖書館工具。
