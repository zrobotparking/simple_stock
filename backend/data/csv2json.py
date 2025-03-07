import csv
import json

def big5_csv_to_json(csv_filepath, json_filepath):
    data = {}
    with open(csv_filepath, 'r', encoding='big5', errors='ignore') as csvfile:
        # 使用 errors='ignore' 忽略解碼錯誤
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            stock_code = row['公司代號'].strip()
            company_name = row['公司簡稱'].strip()
            data[stock_code] = company_name

    with open(json_filepath, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=4)

# 假設您的 CSV 檔案路徑是 'backend/data/t51sb01_20250308_034617942.csv'
csv_filepath = 'backend/data/t51sb01_20250308_034617942.csv'
json_filepath = 'backend/stock_names.json'  # 輸出到 backend/stock_names.json
big5_csv_to_json(csv_filepath, json_filepath)