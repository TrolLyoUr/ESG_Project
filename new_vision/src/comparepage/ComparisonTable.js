import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap for styling
import "./ComparisonTable.css"; // Custom CSS for the comparison table
import { SERVER_URL } from "./config"; // Base URL for making API requests

// Mapping framework IDs to their respective names
const frameworkMapping = {
  1: "GRI",
  2: "SASB",
  3: "TCFD",
};

// Component for comparing ESG scores and metrics between two companies
const ComparisonTable = ({
  company1,
  year1,
  company2,
  year2,
  companyid1,
  companyid2,
  framework,
}) => {
  // State for holding combined metrics, individual scores, and chart data
  const [mergedMetrics, setMergedMetrics] = useState({});
  const [openMetrics, setOpenMetrics] = useState({});
  const [esgScore1, setEsgScore1] = useState(null);
  const [esgScore2, setEsgScore2] = useState(null);
  const [chartData, setChartData] = useState({});
  const [isTimeout, setIsTimeout] = useState(false);

  // Fetch data for company1 based on framework and year
  useEffect(() => {
    if (companyid1 && year1 && framework) {
      console.log("Fetching data for company1:", companyid1, year1, framework);
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${SERVER_URL}/app/calculateperformance?company=${companyid1}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          console.log("Data from backend:", data);
          const frameworkName = frameworkMapping[framework];
          console.log("Framework name:", frameworkName);

          const yearData = data[frameworkName];
          console.log("Year data for framework:", yearData);
          const score1 =
            yearData && yearData[year1] !== undefined
              ? yearData[year1]["total_score"].toFixed(3)
              : null;

          setEsgScore1(score1);
          console.log("Score1:", score1);
        } catch (error) {
          console.error("Error fetching data:", error);
          setEsgScore1(null);
        }
      };

      fetchData();
    } else {
      console.log("Missing parameters: companyId, year, or frameworkId");
      setEsgScore1(null);
    }
  }, [framework, companyid1, year1]); // Dependencies include framework, companyid1, year1

  // Similar fetch operation for company2
  useEffect(() => {
    if (companyid2 && year2 && framework) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${SERVER_URL}/app/calculateperformance?company=${companyid2}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          const frameworkName = frameworkMapping[framework];
          console.log("Framework name:", frameworkName);

          const yearData = data[frameworkName];
          console.log("Year data for framework:", yearData);
          const score2 =
            yearData && yearData[year2] !== undefined
              ? yearData[year2]["total_score"].toFixed(3)
              : null;
          setEsgScore2(score2);
        } catch (error) {
          console.error("Error fetching data:", error);
          setEsgScore2(null);
        }
      };

      fetchData();
    } else {
      console.log("Missing parameters: companyId, year, or frameworkId");
      setEsgScore2(null);
    }
  }, [framework, companyid2, year2]); // Dependencies include framework, companyid2, year2

  // Fetch indicator data for comparison between the two companies
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url1 = `${SERVER_URL}/app/indicatordata?company=${companyid1}&year=${year1}&framework=${framework}`;
        const url2 = `${SERVER_URL}/app/indicatordata?company=${companyid2}&year=${year2}&framework=${framework}`;
        const response1 = await fetch(url1, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const response2 = await fetch(url2, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response1.ok) {
          throw new Error(`Network response was not ok: ${response1.status}`);
        }

        if (!response2.ok) {
          throw new Error(`Network response was not ok: ${response2.status}`);
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        const result = mergeIndicatorData(data1, data2);
        setMergedMetrics(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [framework, companyid1, year1, companyid2, year2]); // Dependencies include framework, companyids, and years

  // Merge data from both companies for display
  function mergeIndicatorData(data1, data2) {
    const mergedData = {};

    Object.keys(data1).forEach((metricId) => {
      const metric = data1[metricId];
      mergedData[metricId] = {
        metric_id: metric.metric_id,
        metric_name: metric.metric_name,
        pillar: metric.pillar,
        indicators: {},
      };

      metric.indicators.forEach((indicator) => {
        mergedData[metricId].indicators[indicator.indicator_id] = {
          indicator_id: indicator.indicator_id,
          indicator_name: indicator.indicator_name,
          value1: indicator.value,
          unit: indicator.unit,
          year: indicator.year,
          source: indicator.source,
        };
      });

      if (data2[metricId]) {
        data2[metricId].indicators.forEach((indicator) => {
          if (mergedData[metricId].indicators[indicator.indicator_id]) {
            mergedData[metricId].indicators[indicator.indicator_id].value2 =
              indicator.value;
          } else {
            mergedData[metricId].indicators[indicator.indicator_id] = {
              indicator_id: indicator.indicator_id,
              indicator_name: indicator.indicator_name,
              value2: indicator.value,
              unit: indicator.unit,
              year: indicator.year,
              source: indicator.source,
            };
          }
        });
      }
    });

    Object.keys(mergedData).forEach((metricId) => {
      const indicatorsArray = [];
      Object.keys(mergedData[metricId].indicators).forEach((indicatorId) => {
        indicatorsArray.push(mergedData[metricId].indicators[indicatorId]);
      });
      mergedData[metricId].indicators = indicatorsArray;
    });

    return mergedData;
  }

  // Toggle visibility of metric details and fetch chart data if not already loaded
  const toggleMetric = async (metricId) => {
    setOpenMetrics((prev) => ({ ...prev, [metricId]: !prev[metricId] }));
    if (!chartData[metricId]) {
      try {
        const url1 = `${SERVER_URL}/app/metricsdatavalue/?companies=${companyid1}&framework=${framework}&metrics=${metricId}`;
        const url2 = `${SERVER_URL}/app/metricsdatavalue/?companies=${companyid2}&framework=${framework}&metrics=${metricId}`;
        const responses = await Promise.all([
          fetch(url1, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(url2, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        responses.forEach((response) => {
          if (!response.ok)
            throw new Error(`Failed to fetch data for metric ${metricId}`);
        });

        const data = await Promise.all(responses.map((res) => res.json()));
        console.log("Complete data from backend:", data);

        const chartData = {
          labels: data[0].data[0].metrics_scores.map((score) => score.year),
          datasets: [
            {
              label: `Company 1: ${company1} (${year1})`,
              data: data[0].data[0].metrics_scores.map((score) => score.score),
              fill: false,
              borderColor: "rgb(75, 192, 192)",
            },
            {
              label: `Company 2: ${company2} (${year2})`,
              data: data[1].data[0].metrics_scores.map((score) => score.score),
              fill: false,
              borderColor: "rgb(255, 99, 132)",
            },
          ],
        };

        setChartData((prev) => ({ ...prev, [metricId]: chartData }));
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }
  };

  // Options for rendering the line chart
  const options = {
    legend: {
      display: true,
      position: "top",
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
          scaleLabel: {
            display: true,
            labelString: "Score", // Label for the y-axis
          },
        },
      ],
    },
  };

  // Render the comparison table with ESG scores and metric details
  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Company names</th>
            <th colSpan="2">
              {company1} ({year1})
            </th>
            <th colSpan="2">
              {company2} ({year2})
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="esg-score">ESG Score</td>
            <td colSpan="2" className="esg-score-cell">
              {esgScore1 !== null ? esgScore1 : "Unavailable"}
            </td>
            <td colSpan="2" className="esg-score-cell">
              {esgScore2 !== null ? esgScore2 : "Unavailable"}
            </td>
          </tr>
          {Object.keys(mergedMetrics).map((metricId) => {
            const metric = mergedMetrics[metricId];
            const pillarClass = `pillar-${metric.pillar.toLowerCase()}`;
            return (
              <React.Fragment key={metricId}>
                <tr
                  onClick={() => toggleMetric(metricId)}
                  className="metric-row"
                >
                  <td>
                    {metric.metric_name}{" "}
                    <span className={`${pillarClass} pillar-indicator`}>
                      {metric.pillar.toUpperCase()}
                    </span>
                  </td>
                  <td colSpan="4">Click to view details</td>
                </tr>
                {openMetrics[metricId] && (
                  <>
                    <tr>
                      <td colSpan="5">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Indicator Name</th>
                              <th>
                                {company1}({year1})
                              </th>
                              <th>
                                {company2}({year2})
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {metric.indicators.map((indicator) => (
                              <tr
                                key={indicator.indicator_id}
                                className="indicator-row"
                              >
                                <td>{indicator.indicator_name}</td>
                                <td>
                                  {indicator.value1 || "N/A"} {indicator.unit}
                                </td>
                                <td>
                                  {indicator.value2 || "N/A"} {indicator.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5">
                        {chartData[metricId] ? (
                          <div className="chart-container1">
                            <Line
                              data={chartData[metricId]}
                              options={options}
                            />
                          </div>
                        ) : (
                          <p className="loading-text">Loading chart...</p>
                        )}
                        <div className="legend">Green line:{company1} </div>
                        <div className="legend">Red line: {company2}</div>
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
