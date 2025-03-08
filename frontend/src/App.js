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
    // const [maDays, setMaDays] = useState(5);        // 移除
    const chartRef = useRef(null);

    const handleSubmit = useCallback(async () => {
        try {
            // const endDate = new Date(startDate);  // 移除
            // const realStartDate = new Date(endDate.getTime() - (dateRange - 1) * 24 * 60 * 60 * 1000); // 移除
            // const startDateStr = realStartDate.toISOString().split('T')[0]; // 移除
            // const endDateStr = endDate.toISOString().split('T')[0]; // 移除

            // const requestUrl = `/api/stock/${stockCode}?start=${startDateStr}&end=${endDateStr}&ma=${maDays}`; //移除ma
            const requestUrl = `/api/stock/${stockCode}`; // 現在只傳遞 stockCode
            console.log('Request URL:', requestUrl);

            const response = await axios.get(requestUrl);
            console.log('Response from backend:', response);

            if (!response.data || typeof response.data !== 'object' ||
                !response.data.hasOwnProperty('kData') || !Array.isArray(response.data.kData) ||
                !response.data.hasOwnProperty('volumes') || !Array.isArray(response.data.volumes) ||
                !response.data.hasOwnProperty('dates') || !Array.isArray(response.data.dates) ||
                !response.data.hasOwnProperty('ma5') || !Array.isArray(response.data.ma5) ||
                !response.data.hasOwnProperty('ma10') || !Array.isArray(response.data.ma10)||
                !response.data.hasOwnProperty('ma15') || !Array.isArray(response.data.ma15)||
                !response.data.hasOwnProperty('ma20') || !Array.isArray(response.data.ma20)) {
                console.error("Error: Invalid data received from backend.", response.data);
                alert("從伺服器接收到的資料格式不正確。");
                return;
            }

            setCompanyNameZh(response.data.companyNameZh);

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
            };
            console.log("newData:", newData);
            setChartData(newData);

            setVolumeMax(null);
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
            alert("獲取股票資料錯誤，請確認股票代碼是否正確。");
        }
    }, [stockCode, setHistory]);  // 簡化依賴項

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
                    <StockChart
                        chartData={chartData}
                        companyNameZh={companyNameZh}
                        stockCode={stockCode}
                        volumeMax={volumeMax}
                        volumeRangeValue={volumeRangeValue}
                        ref={chartRef}
                    />
                </div>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
                    資料來源：Yahoo Finance (yfinance), 公開資訊觀測站 (公司名稱)
                </p>
            </div>

            <HistoryList history={history} onSelectStock={handleSelectStock} />
        </div>
    );
}

export default App;