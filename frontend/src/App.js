import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import StockChart from './components/StockChart';
import HistoryList from './components/HistoryList';
import Controls from './components/Controls';
import './App.css';

function App() {
    const [stockCode, setStockCode] = useState('');
    const [companyNameZh, setCompanyNameZh] = useState('');
    const [chartData, setChartData] = useState(null);
    const [history, setHistory] = useState([]);
    // const [dateRange, setDateRange] = useState(180);   // 移除
    // const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // 移除
    const [volumeMax, setVolumeMax] = useState(null);
    const [volumeRangeValue, setVolumeRangeValue] = useState(50);
    //const [maDays, setMaDays] = useState(5);  //這個不再需要
    const chartRef = useRef(null); // Ref to hold the StockChart instance

    // 在 App.js 中新增 period, startDate, endDate 的 state
    const [period, setPeriod] = useState('3mo'); // 預設時間範圍
    const [customDateRange, setCustomDateRange] = useState(false); // 是否使用自訂日期
    const [startDate, setStartDate] = useState('');  // 自訂開始日期
    const [endDate, setEndDate] = useState('');    // 自訂結束日期


    const handleSubmit = useCallback(async () => {
        try {
            let requestUrl = `/api/stock/${stockCode}`;

            if (customDateRange) {
                // 如果使用者選擇了自訂日期範圍，則使用 start 和 end 參數
                if (!startDate || !endDate) {
                    alert("請選擇開始日期和結束日期。");
                    return;
                }
                requestUrl += `?start=${startDate}&end=${endDate}`;
            } else {
                // 否則，使用 period 參數
                requestUrl += `?period=${period}`;
            }

            console.log('Request URL:', requestUrl);

            const response = await axios.get(requestUrl);
            console.log('Response from backend:', response);

            // --- 嚴格的檢查開始 ---
            if (!response.data) {
                console.error("Error: response.data is undefined or null.");
                alert("從伺服器接收到的資料無效 (response.data 為空)。");
                return;
            }

            if (typeof response.data !== 'object') {
                console.error("Error: response.data is not an object.", response.data);
                alert("從伺服器接收到的資料格式不正確 (response.data 不是物件)。");
                return;
            }

            // 檢查必要的屬性是否存在，以及它們是否為陣列
            const requiredKeys = ['kData', 'volumes', 'dates', 'ma5', 'ma10', 'ma15', 'ma20', 'rsi', 'macd', 'signal', 'hist', 'k', 'd'];
            for (const key of requiredKeys) {
                if (!response.data.hasOwnProperty(key) || !Array.isArray(response.data[key])) {
                    console.error(`Error: response.data.${key} is missing or not an array.`, response.data);
                    alert(`從伺服器接收到的資料缺少 ${key} 屬性或格式不正確。`);
                    return;
                }
            }

            setCompanyNameZh(response.data.companyNameZh);
            // setCompanyNameEn(response.data.companyNameEn);  英文名稱先不處理

            const kData = response.data.kData.map(item => item.map(value => parseFloat(value)));
            const volumes = response.data.volumes.map(vol => parseInt(vol, 10));

            // 準備要傳遞給 setChartData 的資料，包含所有指標
            const newData = {
                dates: response.data.dates,
                kData: kData,
                volumes: volumes,
                ma5: response.data.ma5,
                ma10: response.data.ma10,
                ma15: response.data.ma15,
                ma20: response.data.ma20,
                rsi: response.data.rsi,
                macd: response.data.macd,
                signal: response.data.signal,
                hist: response.data.hist,
                k: response.data.k,
                d: response.data.d
            };
            console.log("newData:", newData)
            setChartData(newData);


            setVolumeMax(null); // 重置 volumeMax，讓 StockChart 重新計算
            setVolumeRangeValue(50);

            setHistory(prevHistory => {
                const newHistory = [{ code: stockCode, name: response.data.companyNameZh }, ...prevHistory];
                const uniqueHistory = [];
                const seen = new Set();
                for (const item of newHistory) {
                    if (!seen.has(item.code)) {
                        uniqueHistory.push(item);
                        seen.add(item.code);
                    }
                }
                return uniqueHistory.slice(0, 10);
            });

        } catch (error) {
            console.error("獲取股票資料錯誤", error);
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                console.error('Error Response Status:', error.response.status);
                console.error('Error Response Headers:', error.response.headers);
            } else if (error.request) {
                console.error('Error Request:', error.request);
            } else {
                console.error('Error Message:', error.message);
            }
            alert("獲取股票資料錯誤，請確認股票代碼是否正確。");
        }
    }, [stockCode, startDate, endDate, period, customDateRange, setHistory]); // useCallback 依赖项, 移除maDays

    const handleSelectStock = useCallback((code, name) => {
        setStockCode(code);
        setCompanyNameZh(name);
    }, []);

    const handleVolumeRangeChange = useCallback((event) => {
        setVolumeRangeValue(parseInt(event.target.value, 10));
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
            <div style={{ width: '800px', marginRight: '20px', position: 'relative' }}>
                <h1 style={{ textAlign: 'center' }}>台灣股票資訊</h1>

              <Controls
                    stockCode={stockCode}
                    setStockCode={setStockCode}
                    handleSubmit={handleSubmit}
                    chartRef={chartRef}
                    period={period}
                    setPeriod={setPeriod}
                    customDateRange={customDateRange}
                    setCustomDateRange={setCustomDateRange}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />

                <div style={{ display: 'flex' }}>
                    <div className="volume-slider-container">
                        <input
                            type="range"
                            min="1"
                            max="400"
                            value={volumeRangeValue}
                            onChange={handleVolumeRangeChange}
                            className="volume-slider"
                        />
                    </div>
                    {/*  將原本 App.js 中與圖表相關的內容 (初始化 ECharts、設定 option、事件監聽等) 全部移到了 StockChart 元件中。 */}
                    {/*  App.js 只負責將資料 (chartData, companyNameZh, stockCode 等) 作為 props 傳遞給 StockChart。 */}
                    <StockChart
                        chartData={chartData}
                        companyNameZh={companyNameZh}
                        stockCode={stockCode}
                        volumeMax={volumeMax}
                        volumeRangeValue={volumeRangeValue}
                        // maDays={maDays} 不再需要
                        ref={chartRef} // Pass the ref to StockChart
                    />
                </div>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
                    資料來源：Yahoo Finance (yfinance), 公開資訊觀測站 (公司名稱)
                </p>
            </div>

            {/* 歷史查詢列表 */}
            <HistoryList history={history} onSelectStock={handleSelectStock} />
        </div>
    );
}

export default App;