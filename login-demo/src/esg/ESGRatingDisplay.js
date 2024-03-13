import React from 'react';
import './ESGRatingDisplay.css';

const ESGRatingDisplay = () => {
  return (
    <div className="esg-rating-display">
      <h2>ESG Rating</h2>
      <div className="rating">83</div>
      <button className="show-chart-btn">Show Chart</button> {/* 添加显示图表的按钮 */}
    </div>
  );
};

export default ESGRatingDisplay;
