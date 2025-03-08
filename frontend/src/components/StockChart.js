import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';

// Use forwardRef to forward the ref from App to the internal chartRef
const StockChart = forwardRef(({ chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue, maDays }, ref) => {
    const chartRef = useRef(null); // Ref for the chart DOM element

    // Expose methods to the parent component using useImperativeHandle
    useImperativeHandle(ref, () => ({
        resetXZoom: () => {
            if (chartRef.current) {
                const myChart = echarts.getInstanceByDom(chartRef.current);
                myChart.dispatchAction({
                    type: 'dataZoom',
                    dataZoomIndex: [0, 1], // X-axis dataZooms
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
                    dataZoomIndex: [2, 3], // Y-axis dataZooms
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
            initialVolumeMax = Math.max(...chartData.volumes) * 1.2; // Calculate max volume
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
                data: ['K線', '成交量', `MA${maDays}`],
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
                {
                    name: `MA${maDays}`,
                    type: 'line',
                    data: chartData ? chartData[`ma${maDays}`] : [],
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
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
    }, [chartData, companyNameZh, stockCode, volumeMax, volumeRangeValue, maDays]);

    return <div ref={chartRef} style={{ width: '100%', height: '600px' }}></div>;
});

export default StockChart;