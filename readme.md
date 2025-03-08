# 台灣股票資訊查詢服務

## 專案簡介

本專案是一個基於 Web 的台灣股票資訊查詢服務，使用者可以輸入股票代碼，查詢該股票近三個月的日 K 線圖、成交量圖，以及 5 日、10 日、15 日和 20 日均線。本專案採用前後端分離的架構，具有良好的可擴充性。

## 功能

*   **股票查詢：** 輸入股票代碼，即可查詢。
*   **K 線圖：** 顯示近三個月的日 K 線圖。
*   **成交量圖：** 顯示成交量圖，並提供垂直拉桿來調整顯示範圍。
*   **均線：** 顯示 5 日、10 日、15 日和 20 日均線 (MA5, MA10, MA15, MA20)。
*   **縮放：** 提供 X 軸和 Y 軸的 dataZoom 控制項 (包含內建縮放和滑動條)，可自由縮放圖表。
*   **重置縮放：** 提供按鈕，可將 X 軸和 Y 軸的縮放重置為初始狀態。
*   **歷史查詢：** 記錄最近 10 次查詢的股票，點擊歷史記錄可快速重新查詢。
*   **公司名稱：** 顯示查詢股票的中文公司名稱。
*   **日期範圍選擇:** 可以用預設的period，或自訂起訖日期來查詢

## 技術棧

### 前端

*   **框架：** React
*   **圖表庫：** ECharts
*   **HTTP 請求：** Axios
*   **UI 組件庫：** (無)
*    **圖示:** FontAwesome

### 後端

*   **語言：** Python
*   **框架：** Flask
*   **資料庫：** (無，使用簡單的記憶體內快取)
*   **資料來源：**
    *   yfinance (Yahoo Finance API) - 股票歷史資料
    *   公開資訊觀測站 - 中文公司名稱 (透過 `stock_names.json` 檔案)


## 環境設定與安裝

### 前端

1.  **安裝 Node.js 和 npm：** 確保您的系統已安裝 Node.js (建議使用 LTS 版本) 和 npm。
2.  **進入前端目錄：**
    ```bash
    cd frontend
    ```
3.  **安裝依賴：**
    ```bash
    npm install
    ```

### 後端

1.  **安裝 Python：** 確保您的系統已安裝 Python 3 (建議使用 Python 3.7 或更高版本)。
2.  **進入後端目錄：**
    ```bash
    cd ../backend
    ```
3.  **建立虛擬環境 (建議)：**
    ```bash
    python3 -m venv venv
    ```
4.  **啟動虛擬環境：**
    *   Windows:
        ```bash
        venv\Scripts\activate
        ```
    *   macOS / Linux:
        ```bash
        source venv/bin/activate
        ```
5.  **安裝依賴：**
    ```bash
    pip install -r requirements.txt
    ```
6.  **準備 `stock_names.json`：** 參考下方的 "資料來源與 `stock_names.json`" 章節。

## 啟動專案

### 開發模式

1.  **啟動後端伺服器：**
    *   在 `backend` 目錄下，確保已啟動虛擬環境，然後執行：
        ```bash
        python app.py
        ```
    *   Flask 應用程式預設會在 `http://localhost:5001` 運行。

2.  **啟動前端開發伺服器：**
    *   在 `frontend` 目錄下，執行：
        ```bash
        npm start
        ```
    *   瀏覽器會自動開啟應用程式，通常在 `http://localhost:3000`。

### 部署

請參考相關文件，將前端和後端程式碼分別部署到 Web 伺服器和應用程式伺服器。

## API 說明

### 取得股票資料

**URL:** `/api/stock/<stock_code>`

**Method:** `GET`

**參數：**

*   `stock_code`: 股票代碼 (例如 `2330`)。
*   `start` (可選): 開始日期，格式為 `YYYY-MM-DD`。
*    `end` (可選): 結束日期，格式為 `YYYY-MM-DD`。
*   如果提供了 `start` 和 `end`，則查詢指定日期範圍的資料。
*   如果沒有提供 `start` 和 `end`，則查詢最近三個月 (`period='3mo'`) 的資料。

**回應 (JSON)：**

```json
{
  "dates": ["2023-12-01", "2023-12-04", ...],  // 日期
  "kData": [[150.0, 152.5, 149.8, 151.2], ...],// [開盤價, 收盤價, 最低價, 最高價]
  "volumes": [1000000, 1200000, ...],          // 成交量
  "companyNameZh": "台積電",                   // 中文公司名稱
  "companyNameEn": "TSM",                      // 英文公司名稱/代號 (如果有)
  "ma5": [null, null, null, null, 151.5, ...],   // 5 日均線
  "ma10": [null, null, null, null, null, ..., 152.8, ...], // 10 日均線
  "ma15": [...],                               // 15 日均線
  "ma20": [...]                                // 20 日均線
}