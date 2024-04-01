import React, { useState, useEffect } from 'react';
import './Feature4.css'; // 确保你有对应的CSS文件和样式

const Feature4 = () => {
  const [metrics, setMetrics] = useState([]); // 初始状态为空数组

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('YOUR_METRICS_ENDPOINT'); // 替换为你的后端API端点
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json(); // 假设后端返回的数据格式是 [{ id: 1, name: 'Metric 1', weight: 10, selected: false }, ...]
        setMetrics(data); // 使用后端数据设置metrics状态
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, []); // 空依赖数组意味着这个effect仅在组件挂载时运行一次

  const handleSelect = (id) => {
    setMetrics(metrics.map(metric =>
      metric.id === id ? { ...metric, selected: !metric.selected } : metric
    ));
  };

  const handleWeightChange = (id, weight) => {
    setMetrics(metrics.map(metric =>
      metric.id === id ? { ...metric, weight: Number(weight) } : metric
    ));
  };

  return (
    <div className="feature-area feature-area-4">
      <ul>
        {metrics.map(metric => (
          <li key={metric.id}>
            <input
              type="checkbox"
              checked={metric.selected}
              onChange={() => handleSelect(metric.id)}
            />
            {metric.name}
            <input
              type="number"
              value={metric.weight}
              onChange={(e) => handleWeightChange(metric.id, e.target.value)}
              style={{ marginLeft: '10px' }}
              disabled={!metric.selected} // 仅当metric被选中时启用输入框
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feature4;
