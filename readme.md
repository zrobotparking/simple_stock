
## 環境設定與安裝

### 前端

1.  **安裝 Node.js 和 npm：**  確保您的系統已安裝 Node.js (建議使用 LTS 版本) 和 npm (Node.js 套件管理工具)。
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
    python -m venv venv
    ```

## 啟動專案

### 開發模式

1.  **啟動後端伺服器：**
    *   在 `backend` 目錄下，確保已啟動虛擬環境，然後執行：
        ```bash
        python app.py
        ```
2.  **啟動前端開發伺服器：**
    *   在 `frontend` 目錄下，執行：
        ```bash
        npm start
        ```
    *   瀏覽器會自動開啟應用程式，通常在 `http://localhost:3000`。

### 部署 (簡略說明，詳細步驟請參考相關文件)

1.  **前端：**
    *   建置前端程式碼：
        ```bash
        npm run build
        ```
    *   將 `build` 資料夾中的靜態檔案部署到 Web 伺服器 (例如 Nginx、Apache 或雲端平台)。

2.  **後端：**
    *   將後端程式碼部署到伺服器。
    *   使用 Gunicorn 或 uWSGI 等應用程式伺服器來運行 Flask 應用程式。
    *   (可選) 使用 Docker 容器化部署。

## API 說明

### 取得股票資料

**URL:** `/api/stock/{stock_code}`

**Method:** `GET`

**參數：**

*   `stock_code`: 股票代碼 (例如 2330.TW)

**回應 (JSON)：**

```json
{
  "dates": ["2023-12-01", "2023-12-04", ...],  // 日期
  "kData": [[150.0, 152.5, 149.8, 151.2], ...],// [開盤價, 收盤價, 最低價, 最高價]
  "volumes": [1000000, 1200000, ...]          // 成交量
}