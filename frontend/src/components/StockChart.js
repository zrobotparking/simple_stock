import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';

const StockChart = forwardRef(({ chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue }, ref) => { // 移除 maDays
    const chartRef = useRef(null);

    useImperativeHandle(ref, () => ({
        resetXZoom: () => {
            if (chartRef.current) {
                const myChart = echarts.getInstanceByDom(chartRef.current);
                myChart.dispatchAction({
                    type: 'dataZoom',
                    dataZoomIndex: [0, 1],
                    start: 0,
                    end: 100
                });
            }
        },
        resetYZoom: () => {
            if (chartRef.current) {
                const myChart = echarts.getInstanceByDom(chartRef.current);
                myChart.dispatchAction({
                    type: 'dataZoom',
                    dataZoomIndex: [2, 3],
                    start: 0,
                    end: 100
                });
            }
        }
    }));

    useEffect(() => {
        const myChart = echarts.init(chartRef.current);

        let initialVolumeMax = 1000;
        if (chartData && chartData.volumes) {
            initialVolumeMax = Math.max(...chartData.volumes) * 1.2;
        }

        const option = {
            title: {
                text: chartData ? `<span class="math-inline">\{companyNameZh\} \(</span>{stockCode})` : '台灣股票K線圖',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                // 可以自訂 tooltip 內容
                formatter: function (params) {
                  let res = params[0].name + '<br/>'; // 日期
                    params.forEach(param => {
                      if (param.seriesName === 'K線') {
                        // K 線資料
                        res += `<span class="math-inline">\{param\.seriesName\}\: 開\=</span>{param.value[1]}, 收=<span class="math-inline">\{param\.value\[2\]\}, 低\=</span>{param.value[3]}, 高=${param.value[4]}<br/>`;
                      } else if (param.seriesName === '成交量') {
                         res += `${param.seriesName}: ${param.value}<br/>`;
                      } else if (param.seriesName === 'RSI') {
                          res += `${param.seriesName}: ${param.value.toFixed(2)}<br/>`; //格式化
                      } else if (param.seriesName === 'MACD') {
                           res += `MACD: ${param.value.toFixed(2)}<br/>`;
                      } else if (param.seriesName === 'Signal') {
                        res += `Signal: ${param.value.toFixed(2)}<br/>`;
                      } else if (param.seriesName === 'Hist') {
                        res += `Hist: ${param.value.toFixed(2)}<br/>`;
                      }else if (param.seriesName === 'K') {
                        res += `K: ${param.value.toFixed(2)}<br/>`;
                      }
                      else if (param.seriesName === 'D') {
                        res += `D: ${param.value.toFixed(2)}<br/>`;
                      }
                    });
                    return res;
                }
            },
            legend: {
                // data: ['K線', '成交量', `MA${maDays}`], // 動態 MA 名稱
                data: ['K線', '成交量', 'RSI', 'MACD', 'Signal', 'Hist','K','D'],  //修改
                top: '5%',
                left: '10%'
            },
            grid: [   //  grid 陣列
              {
                  left: '10%',
                  right: '10%',
                  top: '10%',   // 第一個 grid (K 線圖)
                  bottom: '50%', // 調整
                  containLabel: true
              },
              {
                  left: '10%',   // 第二個 grid (RSI)
                  right: '10%',
                  top: '55%',   // 與 K 線圖錯開
                  height: '10%', // 設定高度
                  containLabel: true
              },
              {
                  left: '10%',  // 第三個 grid (MACD)
                  right: '10%',
                  top: '70%',   // 與 RSI 圖錯開
                  height: '10%', // 設定高度
                  containLabel: true
              },
                {
                    left: '10%',  // 第四個 grid (KD)
                    right: '10%',
                    top: '85%',   //
                    height: '10%', // 設定高度
                    containLabel: true
                }
            ],
            xAxis: [
               {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: {
                    rotate: 45,
                },
                axisPointer: {
                    handle: { show: true },
                    link: [{ xAxisIndex: 'all' }],  // 連結所有 X 軸
                },
                gridIndex: 0, // 屬於第一個 grid
            },
            {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: { show: false }, // 隱藏
                gridIndex: 1, // 屬於第二個 grid
                axisPointer: {  link: [{ xAxisIndex: 'all' }] }
            },
            {
                type: 'category',
                data: chartData ? chartData.dates : [], // 與 K 線圖共用 X 軸資料
                axisLabel: { show: false }, // 隱藏
                gridIndex: 2, // 屬於第三個 grid
                 axisPointer: {  link: [{ xAxisIndex: 'all' }] }
            },
            {
                type: 'category',
                data: chartData ? chartData.dates : [], // 與 K 線圖共用 X 軸資料
                axisLabel: { show: false }, // 隱藏
                gridIndex: 3, // 屬於第四個 grid
                axisPointer: {  link: [{ xAxisIndex: 'all' }] }
            }
            ],
            yAxis: [
               {
                    type: 'value',
                    scale: true,
                    splitArea: { show: true },
                    position: 'right',
                    axisLabel: {
                        formatter: '{value}'
                    },
                    gridIndex: 0,
                },
                {
                    type: 'value',
                    scale: true,
                    axisLabel: { show: false },
                    axisLine: { show: true },
                    splitLine: { show: false },
                    max: initialVolumeMax * (100 / volumeRangeValue),
                    gridIndex: 0,
                },
                {
                    scale: true,
                    splitLine: { show: false },
                    gridIndex: 1 // RSI 的 Y 軸
                },
                {
                    scale: true,
                    splitLine: { show: false },
                    gridIndex: 2 // MACD 的 Y 軸
                },
                {
                    scale: true,
                    splitLine: { show: false },
                    gridIndex: 3 // KD 的 Y 軸
                },
            ],
            dataZoom: [
                {
                    id: 'x-inside',
                    type: 'inside',
                    xAxisIndex: [0, 1, 2, 3], // 所有 X 軸
                    start: 0,
                    end: 100
                },
                {
                    id: 'x-slider',
                    type: 'slider',
                    xAxisIndex: [0, 1, 2, 3], // 所有 X 軸
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
                    yAxisIndex: [0, 1],  // 只控制 K 線圖和成交量圖的 Y 軸
                    orient: 'vertical',
                    start: 0,
                    end: 100
                },
                {
                    id: 'y-slider',
                    type: 'slider',
                    yAxisIndex: [0, 1],  // 只控制 K 線圖和成交量圖的 Y 軸
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
                     xAxisIndex: 0, // 明確指定 X 軸
                    yAxisIndex: 0, // 明確指定 Y 軸
                },
                {
                    name: '成交量',
                    type: 'bar',
                    data: chartData ? chartData.volumes : [],
                    yAxisIndex: 1,
                    xAxisIndex: 0, // 明確指定 X 軸
                },
                {
                    name: 'RSI',
                    type: 'line',
                    data: chartData ? chartData.rsi : [],
                    yAxisIndex: 2, // 使用 RSI 的 Y 軸
                    xAxisIndex: 1, // 使用 RSI 的 X 軸
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'MACD',
                    type: 'line',
                    data: chartData ? chartData.macd : [],
                    yAxisIndex: 3,  // 使用 MACD 的 Y 軸
                    xAxisIndex: 2, // 使用 MACD 的 X 軸
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'Signal',
                    type: 'line',
                    data: chartData ? chartData.signal : [],
                    yAxisIndex: 3,  // 使用 MACD 的 Y 軸 (與 MACD 共用)
                    xAxisIndex: 2, // 使用 MACD 的 X 軸
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'Hist',
                    type: 'bar',
                    data: chartData ? chartData.hist : [],
                    yAxisIndex: 3, // 使用 MACD 的 Y 軸 (與 MACD 共用)
                    xAxisIndex: 2, // 使用 MACD 的 X 軸
                },
                {
                    name: 'K',
                    type: 'line',
                    data: chartData ? chartData.k : [],
                    yAxisIndex: 4, // 使用 KD 的 Y 軸
                    xAxisIndex: 3, // 使用 KD 的 X 軸
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'D',
                    type: 'line',
                    data: chartData ? chartData.d : [],
                    yAxisIndex: 4, // 使用 KD 的 Y 軸
                    xAxisIndex: 3, // 使用 KD 的 X 軸
                    smooth: true,
                    showSymbol: false,
                },
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
    }, [chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue]); // 移除 maDays

    return <div ref={chartRef} style={{ width: '100%', height: '600px' }}></div>;
});

export default StockChart;