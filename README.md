# Carrel 座位預約（第 11 週 UI／UX 作業）

大學圖書館自習座位預約網站的第一版可互動 Prototype，使用 [Impeccable](https://github.com/pbakaus/impeccable) skill 的流程完成。

## 怎麼打開

直接用瀏覽器開啟 `index.html` 即可，不需要安裝任何東西。也可以部署到 GitHub Pages。

示範帳號：學號 `s1120001`，密碼 `demo1234`（登入頁有「填入示範帳號」按鈕）。

## 文件

| 檔案 | 內容 | 對應步驟 |
|---|---|---|
| `PRODUCT.md` | 使用者、目的、功能、預約規則與限制 | 1. init |
| `SHAPE.md` | User Flow、各頁 Screen Specifications、主要操作、例外狀態、資訊優先順序 | 2. shape |
| `DESIGN.md` | 視覺方向「閱覽室平面圖」：色彩、字體、版面、元件規範 | 3. 視覺方向 |
| `index.html`、`styles.css`、`app.js` | 可互動 Prototype | 4. Prototype |

## 可以試的功能

- 登入 → 總覽 → 預約（日期與時段 → 樓層與平面圖選位 → 確認）→ 預約完成
- 平面圖篩選：安靜區／討論區、有插座、無障礙座位
- 鍵盤操作座位圖：方向鍵移動、Enter 選取
- 我的預約：報到、取消（開始前 30 分鐘以前）
- 「帳戶與規則」頁的 **示範工具**：
  - 跳到報到時間、跳到報到截止後（模擬未報到記點）
  - 模擬「座位剛被別人預約」
  - 重設所有示範資料

所有資料都是示範用假資料，存在瀏覽器的 localStorage。
