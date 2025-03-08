from flask import Flask, jsonify, request, make_response
import yfinance as yf
from flask_cors import CORS
import json
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# 讀取股票名稱對應表
with open('stock_names.json', 'r', encoding='utf-8') as f:
    stock_names = json.load(f)

cache = {}

# 計算 N 日均線
def calculate_ma(data, days):
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)
    if 'Close' not in data.columns:
        return []
    ma = data['Close'].rolling(window=days).mean()
    return ma.replace({np.nan: None}).tolist()


@app.route('/api/stock/<stock_code>')
def get_stock_data(stock_code):
    print(f"Received request for stock code: {stock_code}")

    ma_days_list = [5, 10, 15, 20]  # 要計算的 MA 天數列表
    print(f"MA days: {ma_days_list}")

    # 快取鍵改為只基於 stock_code，因為現在一次返回所有 MA 的資料
    cache_key = stock_code
    if cache_key in cache:
        print(f"Returning cached data for {cache_key}")
        return jsonify(cache[cache_key])

    try:
        stock = yf.Ticker(f"{stock_code}.TW")

        # 優先使用 start 和 end，其次使用 period
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        period = request.args.get('period', default='3mo')  # 預設為 3 個月

        print(f"Start date: {start_date}, End date: {end_date}, Period: {period}")


        if start_date and end_date:
            data = stock.history(start=start_date, end=end_date)
        else:
             data = stock.history(period=period) #沒有日期 就看period
        print(f"Successfully fetched data using yfinance for {stock_code}")


        if data.empty:
            print("Error: DataFrame is empty!")
            return jsonify({'error': 'No data found for this stock code or date range.'}), 404

        company_name_zh = stock_names.get(stock_code, "N/A")
        try:
            company_name_en = stock.info['symbol']
        except KeyError:
            company_name_en = "N/A"
        print(f"Company Name (zh): {company_name_zh}, (en):{company_name_en} ")

        # 使用 DataFrame 的方式來處理 NaN 和數據轉換
        data = data.apply(pd.to_numeric, errors='coerce')  # 將數據轉換為數值，無法轉換的變為 NaN
        k_data = data[['Open', 'Close', 'Low', 'High']].replace({np.nan: None}).values.tolist()  # NaN 替換為 None
        volumes = data['Volume'].replace({np.nan: None}).astype(float).tolist()
        dates = data.index.strftime('%Y-%m-%d').tolist()

        # 計算多條均線
        ma_data = {}
        for days in ma_days_list:
          ma_data[f'ma{days}'] = calculate_ma(data, days)

        result = {
            'dates': dates,
            'kData': k_data,
            'volumes': volumes,
            'companyNameZh': company_name_zh,
            'companyNameEn': company_name_en,
            **ma_data  # 將所有 ma 資料加入 result
        }
        print("Result keys:", result.keys())

        cache[cache_key] = result  # 快取資料
        print(f"Data processing complete for {stock_code}")
        response = make_response(jsonify(result))
        response.headers['Content-Type'] = 'application/json'
        return response

    except Exception as e:
        print(f"Error fetching data for {stock_code}: {e}")
        response = make_response(jsonify({'error': str(e)}), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

@app.route('/api/clearcache', methods=['POST'])  # 清除快取
def clear_cache():
    global cache
    cache = {}
    return jsonify({'message': 'Cache cleared'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)