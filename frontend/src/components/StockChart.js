import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';

const StockChart = forwardRef(({ chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue, maDays }, ref) => {
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
                }
            },
            legend: {
                data: ['K線', '成交量', 'MA5', 'MA10', 'MA15', 'MA20'], // 添加 MA Legend
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
                },
                 // 多條 MA 線
                {
                    name: 'MA5',
                    type: 'line',
                    data: chartData ? chartData.ma5 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: chartData ? chartData.ma10 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA15',
                    type: 'line',
                    data: chartData ? chartData.ma15 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: chartData ? chartData.ma20 : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
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
// }, [chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue, maDays]); //這是錯的
   }, [chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue]); // 修正後的依賴項

    return <div ref={chartRef} style={{ width: '100%', height: '600px' }}></div>;
});

export default StockChart;