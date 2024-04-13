import React, { useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
 // 引入样式文件
import { Chart, CategoryScale, ArcElement, LineElement, BarElement, PointElement, LinearScale, LineController } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './ChartsContainer.css';
// 注册需要的组件
Chart.register(CategoryScale, ArcElement, LineElement, BarElement, PointElement, LinearScale, LineController);


// 注册需要的组件


const ChartsContainer = () => {
  const [showChart, setShowChart] = useState('');
  // 示例数据和配置，需要根据实际情况调整
  const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Demo Dataset',
        data: [65, 59, 80, 81, 56],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  const barData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Demo Dataset',
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const pieData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Demo Dataset',
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const handleShowChart = (chartType) => {
    setShowChart(chartType);
  };

  return (
    <div className="chart-container">
      <div className="chart-buttons btn-group" role="group"> {/* 使用Bootstrap的按钮组样式 */}
      <button type="button" className="btn custom-line-btn" onClick={() => handleShowChart('line')}>Line Chart</button>
      <button type="button" className="btn custom-bar-btn" onClick={() => handleShowChart('bar')}>Bar Chart</button>
      <button type="button" className="btn custom-pie-btn" onClick={() => handleShowChart('bar')}>Pie Chart</button>


      </div>

      {showChart === 'line' && (
        <div className="chart">
          <Line data={lineData} />
        </div>
      )}
      {showChart === 'bar' && (
        <div className="chart">
          <Bar data={barData} />
        </div>
      )}
      {showChart === 'pie' && (
        <div className="chart">
          <Pie data={pieData} />
        </div>
      )}
    </div>
  );
};

export default ChartsContainer;
