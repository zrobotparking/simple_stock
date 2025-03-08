import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

function Controls({
    stockCode,
    setStockCode,
    dateRange,
    setDateRange,
    startDate,
    setStartDate,
    maDays,
    setMaDays,
    handleSubmit,
    chartRef // Receive chartRef
}) {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    // Get the reset functions from the chartRef
    const resetXZoom = () => {
        if (chartRef.current && chartRef.current.resetXZoom) {
            chartRef.current.resetXZoom();
        }
    };

    const resetYZoom = () => {
       if (chartRef.current && chartRef.current.resetYZoom) {
            chartRef.current.resetYZoom();
        }
    };

    return (
        <>
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
                <label style={{ marginLeft: '20px' }}>
                    MA 天數:
                    <input
                        type="number"
                        value={maDays}
                        onChange={(e) => setMaDays(Math.max(1, parseInt(e.target.value)))}
                        style={{ width: '60px', marginLeft: '5px' }}
                    />
                </label>
            </div>
            <div className="y-zoom-container">
                 <button className="reset-button reset-y" onClick={resetYZoom}>
                    <FontAwesomeIcon icon={faUndo} />
                </button>
            </div>

            <button className="reset-button reset-x" onClick={resetXZoom}>
                <FontAwesomeIcon icon={faUndo} />
            </button>
        </>
    );
}

export default Controls;