"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { SERVER_URL } from "@/lib/config";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonTableProps {
  company1: string;
  year1: string | null;
  company2: string;
  year2: string | null;
  companyid1: string;
  companyid2: string;
  framework: number;
}

interface MetricData {
  [key: string]: number;
}

interface YearData {
  total_score: number;
  metrics: MetricData;
}

interface FrameworkData {
  [year: string]: YearData;
}

interface CompanyData {
  [framework: string]: FrameworkData;
}

const frameworkMapping: Record<number, string> = {
  1: "GRI",
  2: "SASB",
  3: "TCFD",
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  company1,
  year1,
  company2,
  year2,
  companyid1,
  companyid2,
  framework,
}) => {
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });
  const [metricsData1, setMetricsData1] = useState<MetricData>({});
  const [metricsData2, setMetricsData2] = useState<MetricData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const frameworkName = frameworkMapping[framework];
        if (!frameworkName) {
          throw new Error("Invalid framework selected");
        }

        const [response1, response2] = await Promise.all([
          fetch(
            `${SERVER_URL}/app/calculateperformance?company=${companyid1}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${SERVER_URL}/app/calculateperformance?company=${companyid2}`,
            {
              credentials: "include",
            }
          ),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error("Failed to fetch comparison data");
        }

        const data1: CompanyData = await response1.json();
        const data2: CompanyData = await response2.json();

        // Extract metrics data for the selected years
        const metrics1 = data1[frameworkName]?.[year1 ?? ""]?.metrics || {};
        const metrics2 = data2[frameworkName]?.[year2 ?? ""]?.metrics || {};

        setMetricsData1(metrics1);
        setMetricsData2(metrics2);

        // Prepare chart data
        const allYears = new Set([
          ...Object.keys(data1[frameworkName] || {}),
          ...Object.keys(data2[frameworkName] || {}),
        ]);

        const chartDatasets = {
          labels: Array.from(allYears).sort(),
          datasets: [
            {
              label: `${company1} - ${frameworkName}`,
              data: Array.from(allYears)
                .sort()
                .map(
                  (year) => data1[frameworkName]?.[year]?.total_score || null
                ),
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
            {
              label: `${company2} - ${frameworkName}`,
              data: Array.from(allYears)
                .sort()
                .map(
                  (year) => data2[frameworkName]?.[year]?.total_score || null
                ),
              borderColor: "rgb(255, 99, 132)",
              tension: 0.1,
            },
          ],
        };

        setChartData(chartDatasets);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching comparison data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyid1 && companyid2 && framework) {
      fetchData();
    }
  }, [companyid1, companyid2, framework, year1, year2, company1, company2]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "ESG Performance Comparison",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Score",
        },
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading comparison data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="comparison-container">
      <div className="chart-section">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="metrics-comparison">
        <h3>Metrics Comparison</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>
                {company1} ({year1})
              </th>
              <th>
                {company2} ({year2})
              </th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys({ ...metricsData1, ...metricsData2 }).map((metric) => {
              const value1 = metricsData1[metric] || 0;
              const value2 = metricsData2[metric] || 0;
              const difference = value1 - value2;

              return (
                <tr key={metric}>
                  <td>{metric}</td>
                  <td>{value1.toFixed(2)}</td>
                  <td>{value2.toFixed(2)}</td>
                  <td
                    className={
                      difference > 0
                        ? "positive"
                        : difference < 0
                        ? "negative"
                        : ""
                    }
                  >
                    {difference.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
