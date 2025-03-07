from flask import Flask, jsonify, request
import yfinance as yf
from flask_cors import CORS
import json  # 導入 json 模組

app = Flask(__name__)
CORS(app)

# 讀取股票名稱對應表
with open('stock_names.json', 'r', encoding='utf-8') as f:
    stock_names = json.load(f)

cache = {}

@app.route('/api/stock/<stock_code>')
def get_stock_data(stock_code):
    print(f"Received request for stock code: {stock_code}")

    if stock_code in cache:
        print(f"Returning cached data for {stock_code}")
        return jsonify(cache[stock_code])

    try:
        stock = yf.Ticker(f"{stock_code}.TW")
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        print(f"Start date: {start_date}, End date: {end_date}")

        if start_date and end_date:
            data = stock.history(start=start_date, end=end_date)
        else:
            data = stock.history(period="3mo")
        print(f"Successfully fetched data using yfinance for {stock_code}")

        # 從 stock_names.json 中獲取中文名稱
        company_name_zh = stock_names.get(stock_code, "N/A")

        # 獲取英文名稱 (如果有的的話)
        try:
            company_name_en = stock.info['symbol']
        except KeyError:
            company_name_en = "N/A"
        print(f"Company Name (zh): {company_name_zh}, (en):{company_name_en} ")

        k_data = []
        volumes = []
        dates = []
        for index, row in data.iterrows():
            dates.append(index.strftime('%Y-%m-%d'))
            k_data.append([
                float(row['Open']),
                float(row['Close']),
                float(row['Low']),
                float(row['High'])
            ])
            volumes.append(int(row['Volume']))

        result = {
            'dates': dates,
            'kData': k_data,
            'volumes': volumes,
            'companyNameZh': company_name_zh,
            'companyNameEn': company_name_en
        }

        cache[stock_code] = result
        print(f"Data processing complete for {stock_code}")
        return jsonify(result)

    except Exception as e:
        print(f"Error fetching data for {stock_code}: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)