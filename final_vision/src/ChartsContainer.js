import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, ArcElement, LineElement, BarElement, PointElement, LinearScale, LineController } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ChartsContainer.css';
Chart.register(CategoryScale, ArcElement, LineElement, BarElement, PointElement, LinearScale, LineController);

const ChartsContainer = ({ esgByYearData, esgByFrameworkData, metricsData }) => {
  const [showChart, setShowChart] = useState('');

  // Create a function to generate chart data using safe data access
  const generateChartData = (data) => {
    if (!data) { // Check if the data is null or undefined
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Dataset',
          data: Object.values(data),
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
  };

  const lineData = generateChartData(esgByYearData);
  const barData = generateChartData(esgByFrameworkData);
  const pieData = generateChartData(metricsData);

  const handleShowChart = (chartType) => {
    setShowChart(chartType);
  };

  return (
    <div className="chart-container">
      <div className="chart-buttons btn-group">
        <button type="button" className="btn custom-line-btn" onClick={() => handleShowChart('line')}>Line Chart</button>
        <button type="button" className="btn custom-bar-btn" onClick={() => handleShowChart('bar')}>Bar Chart</button>
        <button type="button" className="btn custom-pie-btn" onClick={() => handleShowChart('pie')}>Pie Chart</button>
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
