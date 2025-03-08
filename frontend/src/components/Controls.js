import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

function Controls({
    stockCode,
    setStockCode,
    handleSubmit,
    chartRef
}) {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

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
            {/* 移除日期區間、起始日期和 MA 天數的輸入框 */}
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