"use client";

import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Tooltip,
  ChartData,
  ChartOptions,
  ChartConfiguration,
} from "chart.js";

import { SERVER_URL } from "@/lib/config";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Tooltip
);

interface ChartsContainerProps {
  companyId: string;
  year: string;
  frameworkId: string;
  companyname: string;
}

interface FrameworkData {
  [year: string]: {
    total_score: number;
    metrics: {
      [key: string]: number;
    };
  };
}

interface ApiResponse {
  [framework: string]: FrameworkData;
}

const frameworkMap: Record<string, string> = {
  "1": "GRI",
  "2": "SASB",
  "3": "TCFD",
};

const ChartsContainer: React.FC<ChartsContainerProps> = ({
  companyId,
  year,
  frameworkId,
  companyname,
}) => {
  const [chartData, setChartData] = useState<ChartData<"line" | "bar">>({
    labels: [],
    datasets: [],
  });
  const [apiResponse, setApiResponse] = useState<string>("");
  const [showChart, setShowChart] = useState<boolean>(true);
  const [showBarChart, setShowBarChart] = useState<boolean>(false);
  const [showText, setShowText] = useState<boolean>(false);

  const fetchChartData = async (): Promise<ChartData<"line">> => {
    try {
      const framework = frameworkMap[frameworkId];
      const response = await fetch(
        `${SERVER_URL}/app/calculateperformance?company=${companyId}`,
        {
          credentials: "include",
        }
      );
      const data: ApiResponse = await response.json();
      const resultData = data[framework];

      return {
        labels: Object.keys(resultData).sort(),
        datasets: [
          {
            label: `${framework} Score by Year`,
            data: Object.values(resultData).map(
              (value) => value.total_score || null
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

  const fetchChartMetricsData = async (): Promise<ChartData<"bar">> => {
    try {
      const framework = frameworkMap[frameworkId];
      const response = await fetch(
        `${SERVER_URL}/app/calculateperformance?company=${companyId}`,
        {
          credentials: "include",
        }
      );
      const data: ApiResponse = await response.json();
      const metricsScores = data[framework][year].metrics;

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

  const performApiCall = async () => {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const text = `Analyze the ESG performance of ${companyname} for the year ${year}.`;

    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
        }),
      });

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      setApiResponse(analysisText);
    } catch (error) {
      console.error("Error:", error);
      setApiResponse("Failed to analyze data");
    }
  };

  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const config = context.chart.config as ChartConfiguration<
              "line" | "bar"
            >;
            const chartType = config.type;
            const labelPrefix = chartType === "line" ? "Score" : "Scale";
            return `${labelPrefix}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

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
    setApiResponse("Loading data...");
    await performApiCall();
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
          <Line data={chartData as ChartData<"line">} options={chartOptions} />
        </div>
      )}
      {showBarChart && (
        <div className="chart">
          <Bar data={chartData as ChartData<"bar">} options={chartOptions} />
        </div>
      )}
      {showText && (
        <textarea
          value={apiResponse}
          readOnly
          className="form-control feature-bar-item textarea-feature-bar-item"
          rows={20}
        />
      )}
    </div>
  );
};

export default ChartsContainer;
