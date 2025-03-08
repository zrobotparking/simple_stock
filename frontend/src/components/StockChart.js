import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';
import './StockChart.css';

const StockChart = forwardRef(({ chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue }, ref) => {
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
                text: chartData ? `${companyNameZh} (${stockCode})` : '台灣股票K線圖',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params) {
                    let res = params[0].name + '<br/>';
                    params.forEach(param => {
                        if (param.seriesName === 'K線') {
                            res += `${param.seriesName}: 開=${param.value[1]}, 收=${param.value[2]}, 低=${param.value[3]}, 高=${param.value[4]}<br/>`;
                        } else if (param.seriesName === '成交量') {
                            res += `${param.seriesName}: ${param.value}<br/>`;
                        } else if (param.seriesName === 'RSI') {
                            res += `${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
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
                data: ['K線', '成交量', 'MA5', 'MA10', 'MA15', 'MA20','RSI','MACD','Signal','Hist','K','D'],
                top: '5%',
                left: '10%'
            },
            grid: [
              {
                  left: '10%',
                  right: '10%',
                  top: '10%',
                  bottom: '50%',
                  containLabel: true
              },
              {
                  left: '10%',
                  right: '10%',
                  top: '55%',
                  height: '10%',
                  containLabel: true
              },
              {
                  left: '10%',
                  right: '10%',
                  top: '70%',
                  height: '10%',
                  containLabel: true
              },
                {
                    left: '10%',
                    right: '10%',
                    top: '85%',
                    height: '10%',
                    containLabel: true
                }
            ],
            xAxis: [
               {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: {
                    rotate: 45
                },
                axisPointer: {
                    label:{show:false},
                    handle: { show: true }
                },
                gridIndex: 0
            },
            {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: { show: false },
                gridIndex: 1,
                axisPointer: {  link: [{ xAxisIndex: 'all' }] }
            },
            {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: { show: false },
                gridIndex: 2,
                 axisPointer: {  link: [{ xAxisIndex: 'all' }] }
            },
            {
                type: 'category',
                data: chartData ? chartData.dates : [],
                axisLabel: { show: false },
                gridIndex: 3,
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
                    gridIndex: 1
                },
                {
                    scale: true,
                    splitLine: { show: false },
                    gridIndex: 2
                },
                {
                    scale: true,
                    splitLine: { show: false },
                    gridIndex: 3
                },
            ],
            dataZoom: [
                {
                    id: 'x-inside',
                    type: 'inside',
                    xAxisIndex: [0, 1, 2, 3],
                    start: 0,
                    end: 100
                },
                {
                    id: 'x-slider',
                    type: 'slider',
                    xAxisIndex: [0, 1, 2, 3],
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
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                },
                {
                    name: '成交量',
                    type: 'bar',
                    data: chartData ? chartData.volumes : [],
                    yAxisIndex: 1,
                    xAxisIndex: 0,
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: chartData ? chartData.ma5 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    },
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: chartData ? chartData.ma10 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    },
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                },
                {
                    name: 'MA15',
                    type: 'line',
                    data: chartData ? chartData.ma15 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    },
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: chartData ? chartData.ma20 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    },
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                },
                {
                    name: 'RSI',
                    type: 'line',
                    data: chartData ? chartData.rsi : [],
                    yAxisIndex: 2,
                    xAxisIndex: 1,
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'MACD',
                    type: 'line',
                    data: chartData ? chartData.macd : [],
                    yAxisIndex: 3,
                    xAxisIndex: 2,
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'Signal',
                    type: 'line',
                    data: chartData ? chartData.signal : [],
                    yAxisIndex: 3,
                    xAxisIndex: 2,
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'Hist',
                    type: 'bar',
                    data: chartData ? chartData.hist : [],
                    yAxisIndex: 3,
                    xAxisIndex: 2,
                },
                {
                    name: 'K',
                    type: 'line',
                    data: chartData ? chartData.k : [],
                    yAxisIndex: 4,
                    xAxisIndex: 3,
                    smooth: true,
                    showSymbol: false,
                },
                {
                    name: 'D',
                    type: 'line',
                    data: chartData ? chartData.d : [],
                    yAxisIndex: 4,
                    xAxisIndex: 3,
                    smooth: true,
                    showSymbol: false,
                },
            ]
        };
        // 添加圖表標題和說明
        if (chartData) {
            option.title = [ // 使用 title 陣列
              {
                text: `${companyNameZh} (${stockCode})`,
                left: 'center'
              },
              {
                text: 'K線圖: 顯示價格變化 (開盤、收盤、最高、最低)',
                left: 'center',
                top: '3%', // 調整位置
                textStyle: { fontSize: 12, fontWeight: 'normal' }
              },
              {
                text: 'RSI (相對強弱指標): 衡量超買/超賣 (高於70超買，低於30超賣)',
                left: 'center',
                top: '52%', // 第二個 grid 的上方
                 textStyle: { fontSize: 12, fontWeight: 'normal' }
              },
              {
                text: 'MACD (指數平滑異同移動平均線): 顯示趨勢變化 (金叉看漲，死叉看跌)',
                left: 'center',
                top: '67%',  // 第三個 grid 的上方
                textStyle: { fontSize: 12, fontWeight: 'normal' }
              },
              {
                text: 'KD (隨機指標): 類似RSI，衡量超買/超賣，並有金叉/死叉信號',
                left: 'center',
                top: '82%', // 第四個 grid 的上方
                textStyle: { fontSize: 12, fontWeight: 'normal' }
              }
            ];
        }

        myChart.setOption(option);

        const resizeChart = () => {
            myChart.resize();
        };
        window.addEventListener('resize', resizeChart);

        return () => {
            window.removeEventListener('resize', resizeChart);
            myChart.dispose();
        };
    }, [chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue]);

    return <div ref={chartRef} className="stock-chart-container"></div>;
});

export default StockChart;