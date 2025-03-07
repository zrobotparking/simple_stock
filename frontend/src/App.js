// src/App.js
import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';

function App() {
    const [stockCode, setStockCode] = useState('');
    const [chartData, setChartData] = useState(null);
    const chartRef = React.useRef(null);

    useEffect(() => {
        if (chartData) {
            const myChart = echarts.init(chartRef.current);

            const option = {
                title: { text: `股票 ${stockCode} K線圖` },
                xAxis: { data: chartData.dates },
                yAxis: [
                  { type: 'value', scale: true }, // K線圖
                  { type: 'value', scale: true }  // 成交量
                ],
                series: [
                    {
                        type: 'candlestick',
                        data: chartData.kData,
                        itemStyle: {
                            color: 'red', // 漲
                            color0: 'green', // 跌
                            borderColor: null,
                            borderColor0: null,
                        },
                    },
                    {
                      name: '成交量',
                      type: 'bar',
                      data: chartData.volumes,
                      yAxisIndex: 1
                    }
                ]
            };

            myChart.setOption(option);
        }
    }, [chartData, stockCode]);

    const handleSubmit = async () => {
      try{
        const response = await axios.get(`/api/stock/${stockCode}`);  // 向後端發送請求
        setChartData(response.data);
      }catch(error){
        console.error("獲取股票資料錯誤", error);
        alert("獲取股票資料錯誤，請確認股票代碼是否正確。");
      }
    };

    return (
        <div>
            <h1>台灣股票資訊</h1>
            <input
                type="text"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                placeholder="輸入股票代碼"
            />
            <button onClick={handleSubmit}>查詢</button>
            <div ref={chartRef} style={{ width: '800px', height: '400px' }}></div>
        </div>
    );
}

export default App;