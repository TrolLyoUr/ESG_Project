import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChartsContainer.css";
import axios from "axios";
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

axios.defaults.withCredentials = true;

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

// Mapping of framework IDs to names
const frameworkMap = {
  4: "GRI",
  5: "SASB",
  6: "TCFD",
};

/**
 * Container for rendering ESG performance charts.
 * @param {Object} props - Component props
 * @param {number} props.companyId - Company identifier
 * @param {number} props.year - Year for data retrieval
 * @param {number} props.frameworkId - Framework identifier
 * @param {string} props.companyname - Company name for analysis
 * @param {Array} props.selectedMetrics - Metrics selected for detailed view
 */
const ChartsContainer = ({ companyId, year, frameworkId, companyname }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [apiResponse, setApiResponse] = useState("");
  const [showChart, setShowChart] = useState(true);
  const [showBarChart, setShowBarChart] = useState(false);
  const [showText, setShowText] = useState(false);

  // Function to fetch chart data for the selected framework and year
  const fetchChartData = async () => {
    try {
      const framework = frameworkMap[frameworkId];
      const response = await axios.get(
        `${SERVER_URL}/app/calculateperformance?company=${companyId}`
      );
      const resultData = response.data[framework];
      return {
        labels: Object.keys(resultData).sort(),
        datasets: [
          {
            label: `${framework} Score by Year`,
            data: Object.values(resultData).map(
              (value) => value["total_score"] || null
            ),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error;
    }
  };

  // Function to fetch detailed metrics data for the selected framework and year
  const fetchChartMetricsData = async () => {
    try {
      const framework = frameworkMap[frameworkId];
      const response = await axios.get(
        `${SERVER_URL}/app/calculateperformance?company=${companyId}`
      );
      const metricsScores = response.data[framework][year].metrics;

      return {
        labels: Object.keys(metricsScores),
        datasets: [
          {
            label: `${framework} - Metrics Scores for ${year}`,
            data: Object.values(metricsScores),
            backgroundColor: Object.keys(metricsScores).map(
              () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
            ),
            borderWidth: 1,
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      throw error;
    }
  };

  // Perform a custom API call to analyze data
  const performApiCall = async () => {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    const apiKey = "AIzaSyBbLoDWc9dfyr1nz5ySOc3uGpdiyxLyTG0";
    const text = `Analyze the ESG performance of ${companyname} for the year ${year}.`;
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
        setApiResponse(text);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Handlers to show different charts or analysis results
  const handleShowChart = async () => {
    try {
      const data = await fetchChartData();
      setChartData(data);
      setShowChart(true);
      setShowBarChart(false);
      setShowText(false);
    } catch (error) {
      setChartData({ labels: [], datasets: [] });
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
      setChartData({ labels: [], datasets: [] });
    }
  };

  const handleApiCall = async () => {
    setShowText(true);
    setShowChart(false);
    setShowBarChart(false);
    try {
      setApiResponse("Loading data...");
      const text = await performApiCall();
    } catch (error) {
      setApiResponse("Failed to load data");
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
          value={apiResponse}
          readOnly
          className="form-control feature-bar-item textarea-feature-bar-item"
          rows="20"
        ></textarea>
      )}
    </div>
  );
};

export default ChartsContainer;
