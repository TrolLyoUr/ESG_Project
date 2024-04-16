import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LineElement,
  PointElement,
  LinearScale,
  LineController,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChartsContainer.css";
import { SERVER_URL } from "./config";

Chart.register(
  CategoryScale,
  LineElement,
  PointElement,
  LinearScale,
  LineController
);

const frameworkMap = {
  4: "GRI",
  5: "SASB",
  6: "TCFD",
};

const ChartsContainer = ({ companyId, year, frameworkId }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchChartData = async () => {
    const framework = frameworkMap[frameworkId]; // 根据 frameworkId 获取对应的框架名称
    const url = `${SERVER_URL}/app/calculateperformance?company=${companyId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const resultData = data.result[framework]; // 从返回的 JSON 中获取对应框架的数据

    return {
      labels: Object.keys(resultData).sort(), // 根据年份排序
      datasets: [
        {
          label: `${framework} Score by Year`,
          data: Object.values(resultData).map((value) => value || 0), // 转换为数组并处理 null 值
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };
  };

  const handleShowChart = async () => {
    try {
      const data = await fetchChartData();
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-buttons btn-group">
        <button
          type="button"
          className="btn custom-line-btn"
          onClick={handleShowChart}
        >
          {frameworkMap[frameworkId]} Score Line Chart
        </button>
      </div>
      <div className="chart">
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default ChartsContainer;
