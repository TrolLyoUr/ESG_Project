import React, { useState, useEffect } from 'react';
import './Feature4.css';
import axios from 'axios';

const Feature4 = ({ selectedId }) => { 
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    console.log("fetch")
    const fetchMetrics = async () => {
        try {
          
          const apiURL = `http://9900.seasite.top:8000/app/frameworks/${selectedId}/metrics/`;
          const response = await axios.get(apiURL, { withCredentials: true });// 替换为你的API端点
          
        if (!response.data) 
        {
          // Handle errors
          console.error('Failed to fetch frameworks:', response.statusText);
        }else
        {
          const data = await response.data;
          console.log(data)
          // setFrameworks(data.frameworks);
        } 
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };
    
  
    if (selectedId) {
      fetchMetrics();
    }
  }, [selectedId]);

  const handleSelect = (id) => {
    setMetrics(metrics.map(metric =>
      metric.id === id ? { ...metric, selected: !metric.selected } : metric
    ));
  };

  const handleWeightChange = (id, e) => {
    e.stopPropagation(); 
    const newWeight = Math.max(0, Math.min(Number(e.target.value), 1)); 

    const totalOtherWeights = metrics.reduce((total, metric) => {
      return metric.id !== id && metric.selected ? total + metric.weight : total;
    }, 0);


    if (totalOtherWeights + newWeight <= 1) {
      setMetrics(metrics.map(metric =>
        metric.id === id ? { ...metric, weight: newWeight } : metric
      ));
    } else {
      alert('Selected metrics total weight cannot exceed 1.');
    }
  };

  return (
    <div className="feature-area-4">
      <ul>
        {metrics.map(metric => (
          <li
            key={metric.id}
            className={`metric-item ${metric.selected ? 'selected' : ''}`}
            onClick={() => handleSelect(metric.id)}
          >
            {metric.name}
            {metric.selected && (
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={metric.weight}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleWeightChange(metric.id, e)}
                style={{ marginLeft: '10px' }}
                className="weight-input"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feature4;
