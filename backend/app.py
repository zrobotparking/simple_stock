from flask import Flask, jsonify, request
import yfinance as yf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 簡單的快取 (實際應用中使用 Redis 或 Memcached)
cache = {}

@app.route('/api/stock/<stock_code>')
def get_stock_data(stock_code):
    if stock_code in cache:
        # 直接返回快取中的資料（如果已經是 JSON 相容格式）
        return jsonify(cache[stock_code])

    try:
        # 獲取3個月內的資料
        data = yf.download(f"{stock_code}.TW", period="3mo")

        # 資料處理 (轉換成 ECharts 需要的格式，同時確保是 JSON 相容的)
        k_data = []
        volumes = []
        dates = []
        for index, row in data.iterrows():
            dates.append(index.strftime('%Y-%m-%d'))
            # 將每一列的開盤、收盤、最低、最高價轉換為列表
            k_data.append([
                float(row['Open']),
                float(row['Close']),
                float(row['Low']),
                float(row['High'])
            ])
            volumes.append(int(row['Volume']))  # 確保成交量是整數

        result = {
            'dates': dates,
            'kData': k_data,
            'volumes': volumes
        }

        cache[stock_code] = result  # 將處理後的資料加入快取
        return jsonify(result)

    except Exception as e:
        print(f"Error fetching data for {stock_code}: {e}")  # 輸出錯誤訊息
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)  # 開發模式