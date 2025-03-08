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
    const [dateRange, setDateRange] = useState(180);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [volumeMax, setVolumeMax] = useState(null);
    const [volumeRangeValue, setVolumeRangeValue] = useState(50);
    const [maDays, setMaDays] = useState(5);
    const chartRef = useRef(null); // Ref to hold the StockChart instance


    const handleSubmit = async () => {
      try {
          const endDate = new Date(startDate);
          const realStartDate = new Date(endDate.getTime() - (dateRange - 1) * 24 * 60 * 60 * 1000);
          const startDateStr = realStartDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
  
          const requestUrl = `/api/stock/${stockCode}?start=${startDateStr}&end=${endDateStr}&ma=${maDays}`;
          console.log('Request URL:', requestUrl);
  
          // 告訴 axios 不要自動解析 JSON，而是返回原始文本
          const response = await axios.get(requestUrl, {
              responseType: 'text' // 重要：獲取原始文本
          });
  
          console.log('Response from backend:', response);
          let jsonData;
          try {
              // 手動解析 JSON
              jsonData = JSON.parse(response.data);
              console.log('Parsed JSON data:', jsonData);
          } catch (parseError) {
              console.error("Error parsing JSON:", parseError);
              console.error("Raw response data:", response.data); // 輸出原始回應內容
              alert("從伺服器接收到的資料無法解析為 JSON。");
              return;
          }
  
          // --- 嚴格的檢查開始 (現在檢查 jsonData) ---
          if (!jsonData) {
              console.error("Error: jsonData is undefined or null.");
              alert("從伺服器接收到的資料無效 (jsonData 為空)。");
              return;
          }
  
          if (typeof jsonData !== 'object') {
              console.error("Error: jsonData is not an object.", jsonData);
              alert("從伺服器接收到的資料格式不正確 (jsonData 不是物件)。");
              return;
          }
  
          if (!jsonData.hasOwnProperty('kData')) {
              console.error("Error: jsonData.kData is missing.", jsonData);
              alert("從伺服器接收到的資料缺少 kData 屬性。");
              return;
          }
  
          // ... (其餘對 jsonData.volumes, jsonData.dates, jsonData.ma${maDays} 的檢查) ...
          if (!jsonData.hasOwnProperty('volumes')) {
              console.error("Error: jsonData.volumes is missing.", jsonData);
              alert("從伺服器接收到的資料缺少 volumes 屬性。");
              return;
          }
           if (!jsonData.hasOwnProperty('dates')) {
              console.error("Error: jsonData.dates is missing.", jsonData);
              alert("從伺服器接收到的資料缺少 dates 屬性。");
              return;
          }
  
          if (!Array.isArray(jsonData.kData)) {
              console.error("Error: jsonData.kData is not an array.", jsonData.kData);
              alert("從伺服器接收到的 kData 不是陣列。");
              return;
          }
  
          if (!Array.isArray(jsonData.volumes)) {
              console.error("Error: jsonData.volumes is not an array.", jsonData.volumes);
              alert("從伺服器接收到的 volumes 不是陣列。");
              return;
          }
          if (!Array.isArray(jsonData.dates)) {
              console.error("Error: jsonData.dates is not an array.", jsonData.dates);
              alert("從伺服器接收到的 dates 不是陣列。");
              return;
          }
            if (!jsonData.hasOwnProperty(`ma${maDays}`)) {
              console.error(`Error: jsonData.ma${maDays} is missing.`, jsonData);
              alert(`從伺服器接收到的資料缺少 ma${maDays} 屬性。`);
              return;
          }
  
          if (!Array.isArray(jsonData[`ma${maDays}`])) {
              console.error(`Error: jsonData.ma${maDays} is not an array.`, jsonData[`ma${maDays}`]);
              alert(`從伺服器接收到的 ma${maDays} 不是陣列。`);
              return;
          }
  
          // --- 檢查結束 ---
          setCompanyNameZh(jsonData.companyNameZh);
          // setCompanyNameEn(jsonData.companyNameEn);  英文名稱先不處理
  
          const kData = jsonData.kData.map(item => item.map(value => parseFloat(value)));
          const volumes = jsonData.volumes.map(vol => parseInt(vol, 10));
  
          const newData = {
              dates: jsonData.dates,
              kData: kData,
              volumes: volumes,
          };
          newData[`ma${maDays}`] = jsonData[`ma${maDays}`];
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
  };
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
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    maDays={maDays}
                    setMaDays={setMaDays}
                    handleSubmit={handleSubmit}
                    chartRef={chartRef} // Pass the chartRef to Controls
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
                        maDays={maDays}
                        ref={chartRef} // Pass the ref to StockChart
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