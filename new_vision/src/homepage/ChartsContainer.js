import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChartsContainer.css";
import { SERVER_URL } from "./config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
} from "chart.js";

// Register the controllers and elements for both Line and Bar charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController
);

const frameworkMap = {
  4: "GRI",
  5: "SASB",
  6: "TCFD",
};

const ChartsContainer = ({
  companyId,
  year,
  frameworkId,
  companyname,
  selectedMetrics,
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [apiResponse, setApiResponse] = useState("");
  const [showChart, setShowChart] = useState(true);
  const [showBarChart, setShowBarChart] = useState(false);
  const [showText, setShowText] = useState(false);

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
    console.log("Complete data from backend:", data); // 输出完整的后端数据以供检查
    const resultData = data[framework]; // 从返回的 JSON 中获取对应框架的数据

    return {
      labels: Object.keys(resultData).sort(), // 根据年份排序
      datasets: [
        {
          label: `${framework} Score by Year`,
          data: Object.values(resultData).map(
            (value) => value["total_score"] || null
          ), // 转换为数组并处理 null 值
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };
  };

  const fetchChartMetricsData = async () => {
    const framework = frameworkMap[frameworkId];
    console.log("Selected metrics:", selectedMetrics);
    const url = `${SERVER_URL}/app/calculateperformance?company=${companyId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const jsonData = await response.json();
      console.log("Complete data from backend:", jsonData);

      // Assuming there is only one company in the response for simplicity
      const metricsScores = jsonData[framework][year].metrics;
      console.log("Metrics scores data:", metricsScores);

      // Convert organized data into chart datasets
      const datasets = [
        {
          label: `${framework} - Metrics Scores for ${year}`,
          data: Object.values(metricsScores), // Array of scores
          backgroundColor: Object.keys(metricsScores).map(
            () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
          ), // Random color for each bar
          borderWidth: 1,
        },
      ];

      const labels = Object.keys(metricsScores); // Metric names as labels

      return {
        labels: labels,
        datasets: datasets,
      };
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      throw error; // Rethrow to handle in calling function
    }
  };

  const performApiCall = async () => {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    const apiKey = "AIzaSyBbLoDWc9dfyr1nz5ySOc3uGpdiyxLyTG0"; //
    const text = `Analyze the ESG performance of ${companyname} for the year ${year}.`; // 使用模板字符串整合文本和参数
    const data = {
      contents: [
        {
          parts: [
            {
              text: text,
            },
          ],
        },
      ],
    };

    fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        const text = data.candidates[0].content.parts[0].text;
        setApiResponse(text); // 更新状态以显示文本
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleShowChart = async () => {
    try {
      const data = await fetchChartData();
      setChartData(data);
      setShowChart(true);
      setShowBarChart(false);
      setShowText(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  };

  const handleShowBarChart = async () => {
    try {
      const data = await fetchChartMetricsData();
      setChartData(data);
      setShowChart(false);
      setShowBarChart(true);
      setShowText(false);
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  };

  const handleApiCall = async () => {
    try {
      setApiResponse("Loading...");
      setShowText(true);
      setShowChart(false);
      setShowBarChart(false);
      const data = await performApiCall(); // Implement performApiCall to handle API request
      setApiResponse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-buttons btn-group">
        <button onClick={handleShowChart} className="btn custom-line-btn">
          ESG Line Chart
        </button>
        <button onClick={handleShowBarChart} className="btn custom-line-btn">
          Metrics Bar Chart
        </button>
        <button onClick={handleApiCall} className="btn custom-line-btn">
          Data Analysis
        </button>
      </div>
      {showChart && (
        <div className="chart">
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      )}
      {showBarChart && (
        <div className="chart">
          <Bar
            data={chartData}
            options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
          />
        </div>
      )}
      {showText && (
        <textarea
          value={apiResponse || ""}
          readOnly
          className="form-control feature-bar-item textarea-feature-bar-item"
          rows="20"
        ></textarea>
      )}
    </div>
  );
};

export default ChartsContainer;
