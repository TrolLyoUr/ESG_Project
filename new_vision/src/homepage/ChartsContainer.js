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

  const fetchChartData = async () => {
    const framework = frameworkMap[frameworkId]; // 根据 frameworkId 获取对应的框架名称
    const url = `${SERVER_URL}/app/calculateperformance?company=${companyId}&framework=${frameworkId}&scale=1`;
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
    const resultData = data[framework]; // 从返回的 JSON 中获取对应框架的数据

    return {
      labels: Object.keys(resultData).sort(), // 根据年份排序
      datasets: [
        {
          label: `${framework} Score by Year`,
          data: Object.values(resultData).map((value) => value || null), // 转换为数组并处理 null 值
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
    const url = `${SERVER_URL}/app/metricsdatavalue/?companies=${companyId}&framework=${frameworkId}&metrics=${selectedMetrics.join(
      "&metrics="
    )}`;

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
      if (!jsonData.data || !jsonData.data.length) {
        throw new Error("No data found");
      }

      // Assuming there is only one company in the response for simplicity
      const metricsScores = jsonData.data[0].metrics_scores;
      console.log("Metrics scores data:", metricsScores);

      // Organize data by metric ID
      const scoresByMetric = {};
      const metricNames = {}; // To store metric names for use in labels

      metricsScores.forEach((score) => {
        if (!scoresByMetric[score.metric_id]) {
          scoresByMetric[score.metric_id] = [];
          metricNames[score.metric_id] = score.metric_name; // Store the metric name
        }
        scoresByMetric[score.metric_id].push({
          year: score.year,
          score: score.score >= 0 ? score.score : null, // Keep negative as null for better visualization
        });
      });
      console.log("Scores by metric:", scoresByMetric);

      // Convert organized data into chart datasets
      const datasets = Object.keys(scoresByMetric).map((metricId) => {
        return {
          label: `${framework} - ${metricNames[metricId]} (ID: ${metricId})`, // Include metric name and ID
          data: scoresByMetric[metricId]
            .sort((a, b) => a.year - b.year)
            .map((item) => item.score),
          fill: false,
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color for each line
          tension: 0.1,
        };
      });

      return {
        labels: [...new Set(metricsScores.map((item) => item.year))].sort(
          (a, b) => a - b
        ),
        datasets: datasets,
      };
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      throw error; // Rethrow to handle in calling function
    }
  };

  const handleApiCall = () => {
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
        console.log("Success:", text);
        setApiResponse(text); // 更新状态以显示文本
        toggleDisplay(); // 数据加载完成后切换显示
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
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  };

  const handleShowMetrcisChart = async () => {
    try {
      const data = await fetchChartMetricsData();
      console.log("Metrics chart data:", data);
      setChartData(data);
      setShowChart(true);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  };

  const toggleDisplay = () => {
    setShowChart(!showChart); // 切换显示状态
  };

  return (
    <div className="chart-container">
      <div className="chart-buttons btn-group">
        <button
          type="button"
          className="btn custom-line-btn"
          onClick={handleShowChart}
        >
          ESG Line Chart
        </button>
        <button
          type="button"
          className="btn custom-line-btn"
          onClick={handleShowMetrcisChart}
        >
          Metrics Line Chart
        </button>
        <button
          type="button"
          className="btn custom-line-btn"
          onClick={handleApiCall}
        >
          Data Analysis
        </button>
      </div>
      {showChart ? (
        <div className="chart">
          <Line data={chartData} />
        </div>
      ) : (
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
