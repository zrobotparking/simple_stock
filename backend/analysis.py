import pandas as pd
import numpy as np
# import talib

def calculate_ma(data, days):
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)
    if 'Close' not in data.columns:
        return []
    ma = data['Close'].rolling(window=days).mean()
    return ma.replace({np.nan: None}).tolist()

def analyze_stock(data):
    """
    簡單的量價分析，預測明日走勢。

    Args:
        data: 包含 'kData' (開高低收) 和 'volumes' 的字典。

    Returns:
        一個包含分析結果的字典。
    """
    if not data or not data['kData'] or not data['volumes']:
        return {'prediction': '無法預測 (資料不足)'}

    # 取得最後兩個交易日的資料
    k_data = data['kData']
    volumes = data['volumes']
    if len(k_data) < 2 or len(volumes) < 2:
        return {'prediction': '無法預測 (資料不足)'}

    today_close = k_data[-1][1]  # 今日收盤價 (索引 1)
    yesterday_close = k_data[-2][1]  # 昨日收盤價
    today_volume = volumes[-1]
    yesterday_volume = volumes[-2]

    prediction = "中性"  # 預設值
    if today_close > yesterday_close:
        if today_volume > yesterday_volume:
            prediction = "看漲 (價漲量增)"
        else:
            prediction = "謹慎看漲 (價漲量縮)"
    elif today_close < yesterday_close:
        if today_volume > yesterday_volume:
            prediction = "看跌 (價跌量增)"
        else:
            prediction = "謹慎看跌 (價跌量縮)"
    # 均線判斷:
    ma5_last = data['ma5'][-1] if data['ma5'][-1] is not None else 0
    ma10_last = data['ma10'][-1] if data['ma10'][-1] is not None else 0
    ma15_last = data['ma15'][-1] if data['ma15'][-1] is not None else 0
    ma20_last = data['ma20'][-1] if data['ma20'][-1] is not None else 0
    if ma5_last > ma10_last and ma5_last > ma15_last and ma5_last > ma20_last:
        prediction = "看漲 (均線多頭排列)"
    elif ma5_last < ma10_last and ma5_last < ma15_last and ma5_last < ma20_last:
        prediction = "看跌 (均線空頭排列)"

      # RSI 判斷
    rsi_last = data['rsi'][-1] if data['rsi'] else None
    if rsi_last is not None:
      if rsi_last > 70:
        prediction = "看跌 (RSI 超買)"
      elif rsi_last < 30:
        prediction = "看漲 (RSI 超賣)"
    # MACD 判斷
    macd_last = data['macd'][-1] if data['macd'] else None
    signal_last = data['signal'][-1] if data['signal'] else None

    if macd_last is not None and signal_last is not None:
        if macd_last > signal_last:
            prediction = "看漲 (MACD 金叉)"
        elif macd_last < signal_last:
            prediction = "看跌 (MACD 死叉)"
    # KD 判斷
    k_last = data['k'][-1] if data['k'] else None
    d_last = data['d'][-1] if data['d'] else None
    if k_last is not None and d_last is not None:
        if k_last > 80:
            prediction = "看跌 (KD 超買)"
        elif k_last < 20:
            prediction = "看漲 (KD 超賣)"
        elif k_last > d_last:
            prediction = "看漲 (KD 金叉)"
        elif k_last < d_last:
            prediction = "看跌 (KD 死叉)"
    return {'prediction': prediction}