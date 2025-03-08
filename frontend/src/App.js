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
    const [volumeMax, setVolumeMax] = useState(null);
    const [volumeRangeValue, setVolumeRangeValue] = useState(50);
    const chartRef = useRef(null);
    const [analysis, setAnalysis] = useState(null); // 新增：儲存分析結果

    const handleSubmit = useCallback(async () => {
        try {
            const requestUrl = `/api/stock/${stockCode}`;
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

            if (!response.data.hasOwnProperty('kData')) {
                console.error("Error: response.data.kData is missing.", response.data);
                alert("從伺服器接收到的資料缺少 kData 屬性。");
                return;
            }

            if (!response.data.hasOwnProperty('volumes')) {
                console.error("Error: response.data.volumes is missing.", response.data);
                alert("從伺服器接收到的資料缺少 volumes 屬性。");
                return;
            }
             if (!response.data.hasOwnProperty('dates')) {
                console.error("Error: response.data.dates is missing.", response.data);
                alert("從伺服器接收到的資料缺少 dates 屬性。");
                return;
            }

            if (!Array.isArray(response.data.kData)) {
                console.error("Error: response.data.kData is not an array.", response.data.kData);
                alert("從伺服器接收到的 kData 不是陣列。");
                return;
            }

            if (!Array.isArray(response.data.volumes)) {
                console.error("Error: response.data.volumes is not an array.", response.data.volumes);
                alert("從伺服器接收到的 volumes 不是陣列。");
                return;
            }
            if (!Array.isArray(response.data.dates)) {
                console.error("Error: response.data.dates is not an array.", response.data.dates);
                alert("從伺服器接收到的 dates 不是陣列。");
                return;
            }
            if (!response.data.hasOwnProperty('ma5') || !Array.isArray(response.data.ma5)) {
                console.error("Error: response.data.ma5 is missing or not an array.", response.data);
                alert("從伺服器接收到的 ma5 資料有誤。");
                return;
            }
            if (!response.data.hasOwnProperty('ma10') || !Array.isArray(response.data.ma10)) {
                console.error("Error: response.data.ma10 is missing or not an array.", response.data);
                alert("從伺服器接收到的 ma10 資料有誤。");
                return;
            }
            if (!response.data.hasOwnProperty('ma15') || !Array.isArray(response.data.ma15)) {
                 console.error("Error: response.data.ma15 is missing or not an array.", response.data);
                alert("從伺服器接收到的 ma15 資料有誤。");
                return;
            }
            if (!response.data.hasOwnProperty('ma20') || !Array.isArray(response.data.ma20)) {
                console.error("Error: response.data.ma20 is missing or not an array.", response.data);
                alert("從伺服器接收到的 ma20 資料有誤。");
                return;
            }

            setCompanyNameZh(response.data.companyNameZh);
            // setCompanyNameEn(response.data.companyNameEn);  英文名稱先不處理

            const kData = response.data.kData.map(item => item.map(value => parseFloat(value)));
            const volumes = response.data.volumes.map(vol => parseInt(vol, 10));

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

            setVolumeMax(null);
            setVolumeRangeValue(50);
            // 新增：設定分析結果
            setAnalysis(response.data.analysis);
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
    }, [stockCode, setHistory]); // 簡化依賴項

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
                 {/* 顯示分析結果 */}
                {analysis && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <p><strong>分析結果：</strong> {analysis.prediction}</p>
                    </div>
                )}
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