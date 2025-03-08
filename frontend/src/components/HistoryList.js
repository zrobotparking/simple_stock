import React from 'react';

function HistoryList({ history, onSelectStock }) {
    return (
        <div style={{ width: '200px' }}>
            <h3>歷史查詢</h3>
            <ul>
                {history.map(item => (
                    <li key={item.code} style={{ cursor: 'pointer' }} onClick={() => onSelectStock(item.code, item.name)}>
                        {item.name} ({item.code})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HistoryList;