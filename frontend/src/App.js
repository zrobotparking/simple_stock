import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
    const [stockCode, setStockCode] = useState('');
    const [companyNameZh, setCompanyNameZh] = useState(''); // 新增：中文公司名稱
    const [companyNameEn, setCompanyNameEn] = useState(''); // 新增：英文公司名稱
    const [chartData, setChartData] = useState(null);
    const [history, setHistory] = useState([]); // 修改: 儲存物件 { code, name }
    const chartRef = React.useRef(null);
    const [dateRange, setDateRange] = useState(180);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [volumeMax, setVolumeMax] = useState(null);
    const [volumeRangeValue, setVolumeRangeValue] = useState(50);

    useEffect(() => {
        const myChart = echarts.init(chartRef.current);

        let initialVolumeMax = 1000;
        if (chartData && chartData.volumes) {
            initialVolumeMax = 0;
            for (const vol of chartData.volumes) {
                initialVolumeMax = Math.max(initialVolumeMax, vol);
            }
            initialVolumeMax *= 1.2;
        }

        const option = {
            title: {
                text: chartData ? `${companyNameZh} (${stockCode})` : '台灣股票K線圖', // 修改標題
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['K線', '成交量'],
                top: '5%',
                left: '10%'
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: {
                    rotate: 45,
                },
                axisPointer: {
                    handle: { show: true }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    splitArea: { show: true },
                    position: 'right',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                {
                    type: 'value',
                    scale: true,
                    axisLabel: { show: false },
                    axisLine: { show: true },
                    splitLine: { show: false },
                    max: initialVolumeMax * (100 / volumeRangeValue),
                }
            ],
            dataZoom: [
                {
                    id: 'x-inside',
                    type: 'inside',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                },
                {
                    id: 'x-slider',
                    type: 'slider',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    bottom: '2%',
                    height: 20,
                    left: '10%',
                    right: '15%',
                },
                {
                    id: 'y-inside',
                    type: 'inside',
                    yAxisIndex: [0, 1],
                    orient: 'vertical',
                    start: 0,
                    end: 100
                },
                {
                    id: 'y-slider',
                    type: 'slider',
                    yAxisIndex: [0, 1],
                    orient: 'vertical',
                    right: '2%',
                    top: '10%',
                    bottom: '25%',
                    width: 20,
                    start: 0,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'K線',
                    type: 'candlestick',
                    data: chartData ? chartData.kData : [],
                    itemStyle: {
                        color: 'red',
                        color0: 'green',
                        borderColor: null,
                        borderColor0: null,
                    },
                },
                {
                    name: '成交量',
                    type: 'bar',
                    data: chartData ? chartData.volumes : [],
                    yAxisIndex: 1
                }
            ]
        };

        myChart.setOption(option);

        const resizeChart = () => {
            myChart.resize();
        };
        window.addEventListener('resize', resizeChart);

        return () => {
            window.removeEventListener('resize', resizeChart);
            myChart.dispose();
        };
    }, [chartData, stockCode, volumeMax, volumeRangeValue, companyNameZh]); // 加入 companyNameZh 依賴


    const handleSubmit = async () => {
        try {
            const endDate = new Date(startDate);
            const realStartDate = new Date(endDate.getTime() - (dateRange - 1) * 24 * 60 * 60 * 1000);
            const startDateStr = realStartDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            const requestUrl = `/api/stock/${stockCode}?start=${startDateStr}&end=${endDateStr}`;
            console.log('Request URL:', requestUrl);

            const response = await axios.get(requestUrl);
            console.log('Response from backend:', response);

            // 從後端獲取中英文公司名稱
            setCompanyNameZh(response.data.companyNameZh);
            setCompanyNameEn(response.data.companyNameEn);

            const kData = response.data.kData.map(item => item.map(value => parseFloat(value)));
            const volumes = response.data.volumes.map(vol => parseInt(vol, 10));
            setChartData({
                dates: response.data.dates,
                kData: kData,
                volumes: volumes
            });

            setVolumeMax(null);
            setVolumeRangeValue(50);

             // 更新歷史查詢 (儲存物件)
            setHistory(prevHistory => {
                const newHistory = [{ code: stockCode, name: response.data.companyNameZh }, ...prevHistory];
                // 去除重複項 (只保留第一次出現的)
                const uniqueHistory = [];
                const seen = new Set();
                for (const item of newHistory) {
                    if (!seen.has(item.code)) {
                        uniqueHistory.push(item);
                        seen.add(item.code);
                    }
                }
                return uniqueHistory.slice(0, 10); // 最多保留 10 筆
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

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    const resetXZoom = () => {
        if (chartRef.current) {
            const myChart = echarts.getInstanceByDom(chartRef.current);
            myChart.dispatchAction({
                type: 'dataZoom',
                dataZoomIndex: [0, 1],
                start: 0,
                end: 100
            });
        }
    };

    const resetYZoom = () => {
        if (chartRef.current) {
            const myChart = echarts.getInstanceByDom(chartRef.current);
            myChart.dispatchAction({
                type: 'dataZoom',
                dataZoomIndex: [2, 3],
                start: 0,
                end: 100
            });
        }
    };

    const handleVolumeRangeChange = (event) => {
        setVolumeRangeValue(parseInt(event.target.value));
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
            <div style={{ width: '800px', marginRight: '20px', position: 'relative' }}>
                <h1 style={{ textAlign: 'center' }}>台灣股票資訊</h1>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={stockCode}
                        onChange={(e) => setStockCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="輸入股票代碼"
                    />
                    <button onClick={handleSubmit}>查詢</button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <label>
                        日期區間:
                        <input
                            type="number"
                            value={dateRange}
                            onChange={(e) => setDateRange(Math.max(1, parseInt(e.target.value)))}
                            style={{ width: '60px', marginLeft: '5px' }}
                        />
                        天
                    </label>
                    <label style={{ marginLeft: '20px' }}>
                        起始日期:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ marginLeft: '5px' }}
                        />
                    </label>
                </div>

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
                    <div ref={chartRef} style={{ width: '100%', height: '600px' }}></div>
                </div>

                <div className="y-zoom-container">
                    <button className="reset-button reset-y" onClick={resetYZoom}>
                        <FontAwesomeIcon icon={faUndo} />
                    </button>
                </div>

                <button className="reset-button reset-x" onClick={resetXZoom}>
                    <FontAwesomeIcon icon={faUndo} />
                </button>

                {/* 資料來源標註 */}
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
                    資料來源：Yahoo Finance (yfinance)
                </p>
            </div>

            <div style={{ width: '200px' }}>
                <h3>歷史查詢</h3>
                <ul>
                    {history.map(item => (
                         <li key={item.code} style={{ cursor: 'pointer' }} onClick={() => {setStockCode(item.code); setCompanyNameZh(item.name);}}>
                            {item.name} ({item.code})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;