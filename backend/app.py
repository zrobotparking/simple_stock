from flask import Flask, jsonify, request, make_response
import yfinance as yf
from flask_cors import CORS
import json
import pandas as pd
import numpy as np
# import talib  # 移除 talib
from analysis import analyze_stock

app = Flask(__name__)
CORS(app)

# 讀取股票名稱對應表
with open('stock_names.json', 'r', encoding='utf-8') as f:
    stock_names = json.load(f)

cache = {}

def calculate_ma(data, days):
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)
    if 'Close' not in data.columns:
        return []
    ma = data['Close'].rolling(window=days).mean()
    return ma.replace({np.nan: None}).tolist()

# --- RSI, MACD, KD 計算 (純 Python) ---
def calculate_rsi(data, period=14):
    """計算 RSI (相對強弱指標)"""
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)

    if 'Close' not in data.columns:
        return []

    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).fillna(0)
    loss = (-delta.where(delta < 0, 0)).fillna(0)

    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()


    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.replace({np.nan: None}).tolist()

def calculate_macd(data, fastperiod=12, slowperiod=26, signalperiod=9):
    """計算 MACD (移動平均收斂/發散指標)"""
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)

    if 'Close' not in data.columns:
        return [], [], []

    ema_fast = data['Close'].ewm(span=fastperiod, min_periods=fastperiod).mean()
    ema_slow = data['Close'].ewm(span=slowperiod, min_periods=slowperiod).mean()

    macd = ema_fast - ema_slow
    signal = macd.ewm(span=signalperiod, min_periods=signalperiod).mean()
    hist = macd - signal

    return (
        macd.replace({np.nan: None}).tolist(),
        signal.replace({np.nan: None}).tolist(),
        hist.replace({np.nan: None}).tolist(),
    )

def calculate_kd(data, k_period=9, d_period=3):
    """計算 KD (隨機指標)"""
    if not isinstance(data, pd.DataFrame):
      data = pd.DataFrame(data)
      # 檢查所需的欄位是否存在於 DataFrame 中
    if 'High' not in data.columns or 'Low' not in data.columns or 'Close' not in data.columns:
      return [], []
    # 計算 %K
    low_min = data['Low'].rolling(window=k_period, min_periods=1).min()
    high_max = data['High'].rolling(window=k_period, min_periods=1).max()
    k = 100 * ((data['Close'] - low_min) / (high_max - low_min))
    k = k.replace({np.nan: None})  # 將 NaN 值替換為 None

    # 計算 %D
    d = k.rolling(window=d_period, min_periods=1).mean()
    d = d.replace({np.nan: None})  # 將 NaN 值替換為 None

    return k.tolist(), d.tolist()

@app.route('/api/stock/<stock_code>')
def get_stock_data(stock_code):
    print(f"Received request for stock code: {stock_code}")

    ma_days_list = [5, 10, 15, 20]
    print(f"MA days: {ma_days_list}")

    cache_key = stock_code
    if cache_key in cache:
        print(f"Returning cached data for {cache_key}")
        return jsonify(cache[cache_key])

    try:
        stock = yf.Ticker(f"{stock_code}.TW")
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        period = request.args.get('period', default='3mo')

        print(f"Start date: {start_date}, End date: {end_date}, Period: {period}")

        if start_date and end_date:
            data = stock.history(start=start_date, end=end_date)
        else:
            data = stock.history(period=period)
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

        ma_data = {}
        for days in ma_days_list:
          ma_data[f'ma{days}'] = calculate_ma(data, days)

        # 計算 RSI、MACD、KD (使用純 Python 函數)
        rsi_data = calculate_rsi(data)
        macd_data, signal_data, hist_data = calculate_macd(data)
        k_data_kd, d_data = calculate_kd(data)


        result = {
            'dates': dates,
            'kData': k_data,
            'volumes': volumes,
            'companyNameZh': company_name_zh,
            'companyNameEn': company_name_en,
            **ma_data,
            'rsi': rsi_data,
            'macd': macd_data,
            'signal': signal_data,
            'hist': hist_data,
            'k': k_data_kd,
            'd': d_data
        }
        print("Result keys:", result.keys())
        cache[cache_key] = result
        print(f"Data processing complete for {stock_code}")

        analysis = analyze_stock(result)
        result['analysis'] = analysis

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