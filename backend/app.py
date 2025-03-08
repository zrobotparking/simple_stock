from flask import Flask, jsonify, request, make_response
import yfinance as yf
from flask_cors import CORS
import json
import pandas as pd
import numpy as np
import talib  # 導入 TA-Lib

app = Flask(__name__)
CORS(app)

# 讀取股票名稱對應表
with open('stock_names.json', 'r', encoding='utf-8') as f:
    stock_names = json.load(f)

cache = {}

# 計算 N 日均線 (已存在，保持不變)
def calculate_ma(data, days):
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)
    if 'Close' not in data.columns:
        return []
    ma = data['Close'].rolling(window=days).mean()
    return ma.replace({np.nan: None}).tolist()

# 計算 RSI
def calculate_rsi(data, period=14):
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)

    if 'Close' not in data.columns:
        return []
    close_prices = data['Close']
    rsi = talib.RSI(close_prices, timeperiod=period)
    return rsi.replace({np.nan: None}).tolist()


# 計算 MACD (返回 MACD, Signal, Histogram)
def calculate_macd(data, fastperiod=12, slowperiod=26, signalperiod=9):
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)
    if 'Close' not in data.columns:
        return [], [], []
    close_prices = data['Close']
    macd, signal, hist = talib.MACD(close_prices, fastperiod=fastperiod, slowperiod=slowperiod, signalperiod=signalperiod)
    return macd.replace({np.nan: None}).tolist(), signal.replace({np.nan: None}).tolist(), hist.replace({np.nan: None}).tolist()
    

# 計算 KD (返回 K, D)
def calculate_kd(data, k_period=9, d_period=3):
    if not isinstance(data, pd.DataFrame):
            data = pd.DataFrame(data)

    if 'High' not in data.columns or 'Low' not in data.columns or 'Close' not in data.columns:
        return [], []
    high_prices = data['High']
    low_prices = data['Low']
    close_prices = data['Close']
    # 注意：talib.STOCH 返回的是 %K 和 %D，我們需要的是 K 和 D
    k, d = talib.STOCH(high_prices, low_prices, close_prices, fastk_period=k_period, slowk_period=d_period, slowd_period=d_period)
    return k.replace({np.nan: None}).tolist(), d.replace({np.nan: None}).tolist()


@app.route('/api/stock/<stock_code>')
def get_stock_data(stock_code):
    print(f"Received request for stock code: {stock_code}")

    # ma_days_list = [5, 10, 15, 20]  # 不再需要，MA 在前端處理
    cache_key = stock_code  # 快取只基於 stock_code

    if cache_key in cache:
        print(f"Returning cached data for {cache_key}")
        return jsonify(cache[cache_key])

    try:
        stock = yf.Ticker(f"{stock_code}.TW")
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        period = request.args.get('period', default='3mo')  # 預設為 3 個月

        print(f"Start date: {start_date}, End date: {end_date}, Period: {period}")

        if start_date and end_date:
            data = stock.history(start=start_date, end=end_date)
        else:
            # 支援 period 參數
            data = stock.history(period=period)  # 使用 period
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

        data = data.apply(pd.to_numeric, errors='coerce')
        k_data = data[['Open', 'Close', 'Low', 'High']].replace({np.nan: None}).values.tolist()
        volumes = data['Volume'].replace({np.nan: None}).astype(float).tolist()
        dates = data.index.strftime('%Y-%m-%d').tolist()

        # 計算技術指標
        rsi_data = calculate_rsi(data)
        macd_data, signal_data, hist_data = calculate_macd(data)
        k_data_kd, d_data = calculate_kd(data)

        result = {
            'dates': dates,
            'kData': k_data,
            'volumes': volumes,
            'companyNameZh': company_name_zh,
            'companyNameEn': company_name_en,
            'rsi': rsi_data,       # RSI
            'macd': macd_data,      # MACD
            'signal': signal_data,  # Signal
            'hist': hist_data,      # Histogram
            'k': k_data_kd,          # K
            'd': d_data           # D
        }
        print("Result keys:", result.keys())
        cache[cache_key] = result
        print(f"Data processing complete for {stock_code}")
        response = make_response(jsonify(result))
        response.headers['Content-Type'] = 'application/json'
        return response

    except Exception as e:
        print(f"Error fetching data for {stock_code}: {e}")
        response = make_response(jsonify({'error': str(e)}), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

@app.route('/api/clearcache', methods=['POST'])
def clear_cache():
    global cache
    cache = {}
    return jsonify({'message': 'Cache cleared'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)