import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Collapse,
  ListGroup,
  Form,
  OverlayTrigger,
  Tooltip,
  Alert,
  Modal,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { SERVER_URL } from "./config";
import "./MetricsCard.css";

const csrftoken = Cookies.get("csrftoken");
axios.defaults.headers.common["X-CSRFToken"] = csrftoken;
axios.defaults.withCredentials = true;

const MetricsCard = ({
  currentFramework,
  selectedCompany,
  selectedYear,
  setSelectedMetrics,
  setWeight,
}) => {
  const [modalInfo, setModalInfo] = useState({ show: false, content: "" });
  const [weights, setWeights] = useState({}); // To store all weights
  const [loading, setLoading] = useState(false);
  const [metricScores, setMetricScores] = useState({});
  const [categories, setCategories] = useState({
    E: { open: false, metrics: [] },
    S: { open: false, metrics: [] },
    G: { open: false, metrics: [] },
  });

  useEffect(() => {
    // function to fetch default metrics based on the selected framework
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${SERVER_URL}/app/frameworks/${currentFramework}/metrics/`,
          { withCredentials: true }
        );
        const newMetrics = response.data.map((metric) => ({
          id: metric.metric.id,
          title: metric.metric.name,
          isSelected: false,
          isOpen: false,
          pillar: metric.metric.pillar,
          subMetrics: metric.metric.metric_indicators.map((indicator) => ({
            id: indicator.indicator.id,
            title: indicator.indicator.name,
            weight: indicator.predefined_weight,
          })),
          weight: metric.predefined_weight,
        }));

        const categorizedMetrics = { E: [], S: [], G: [] };
        newMetrics.forEach((metric) => {
          categorizedMetrics[metric.pillar].push(metric);
        });

        setCategories({
          E: { open: false, metrics: categorizedMetrics.E },
          S: { open: false, metrics: categorizedMetrics.S },
          G: { open: false, metrics: categorizedMetrics.G },
        });
        // Initialize weights state
        const initialWeights = {};
        newMetrics.forEach((m) => {
          initialWeights[`metric_${m.id}`] = m.weight;
          m.subMetrics.forEach((sm) => {
            initialWeights[`indicator_${m.id}_${sm.id}`] = sm.weight;
          });
        });
        setWeights(initialWeights);
        return newMetrics; // Return newMetrics for potential chain usage
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        alert("Failed to fetch metrics.");
        setLoading(false);
        return null; // Return null to indicate failure
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch indicator data based on the selected company, framework, and year
    const fetchIndicatorData = async () => {
      setLoading(true);
      try {
        const url = `${SERVER_URL}/app/indicatordata?company=${selectedCompany}&framework=${currentFramework}&year=${selectedYear}`;
        console.log(url);
        const response = await axios.get(url, { withCredentials: true });
        const data = response.data;
        if (Object.keys(data).length === 0 && data.constructor === Object) {
          console.log("No data available for the selected company and year.");
          alert("No data available for the selected company and year.");
          setLoading(false);
          return;
        }
        const newMetrics = Object.values(data).map((metric) => ({
          id: metric.metric_id,
          title: metric.metric_name,
          pillar: metric.pillar,
          weight: metric.predefined_weight,
          isSelected: false,
          isOpen: false,
          subMetrics: metric.indicators.map((ind) => ({
            id: ind.indicator_id,
            title: ind.indicator_name,
            value: ind.value,
            weight: ind.predefined_weight,
            unit: ind.unit,
            source: ind.source,
          })),
        }));

        const categorizedMetrics = { E: [], S: [], G: [] };
        newMetrics.forEach((metric) => {
          categorizedMetrics[metric.pillar].push(metric);
        });

        setCategories({
          E: { open: false, metrics: categorizedMetrics.E },
          S: { open: false, metrics: categorizedMetrics.S },
          G: { open: false, metrics: categorizedMetrics.G },
        });
        // Initialize weights state
        const initialWeights = {};
        newMetrics.forEach((m) => {
          initialWeights[`metric_${m.id}`] = m.weight;
          m.subMetrics.forEach((sm) => {
            initialWeights[`indicator_${m.id}_${sm.id}`] = sm.weight;
          });
        });
        setWeights(initialWeights);
      } catch (error) {
        console.error("Failed to fetch indicator data:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (currentFramework && (selectedCompany == "" || selectedYear == "")) {
      fetchMetrics();
    }
    if (currentFramework && selectedCompany && selectedYear) {
      fetchIndicatorData(); // Chain the promise
    }
  }, [currentFramework, selectedCompany, selectedYear]);

  const toggleCategory = (category) => {
    setCategories((prev) => ({
      ...prev,
      [category]: { ...prev[category], open: !prev[category].open },
    }));
  };

  const handleWeightChange = (key, value) => {
    setWeights({ ...weights, [key]: value });
    setWeight({ ...weights, [key]: value });
  };

  // Function to submit all weights to the API
  const handleSubmitAllWeights = async () => {
    // Prepare data for API requests
    const indicatorsData = [];
    const metricsData = [];
    // Iterate over each category and its metrics
    Object.values(categories).forEach((category) => {
      category.metrics.forEach((metric) => {
        if (weights[`metric_${metric.id}`] !== undefined) {
          metricsData.push({
            metric: metric.id,
            framework: currentFramework, // assuming the framework ID is stored in each metric
            custom_weight: parseFloat(weights[`metric_${metric.id}`]),
          });
        }
        metric.subMetrics.forEach((subMetric) => {
          if (weights[`indicator_${metric.id}_${subMetric.id}`] !== undefined) {
            indicatorsData.push({
              metric: metric.id,
              indicator: subMetric.id,
              custom_weight: parseFloat(
                weights[`indicator_${metric.id}_${subMetric.id}`]
              ),
            });
          }
        });
      });
    });

    try {
      await axios.post(`${SERVER_URL}/app/saveindicator/`, indicatorsData, {
        withCredentials: true,
      });
      alert("Indicator weights updated successfully!");
    } catch (error) {
      console.error("Error submitting weights:", error);
      alert("Failed to update weights.");
    }
    try {
      await axios.post(`${SERVER_URL}/app/savemetrics/`, metricsData, {
        withCredentials: true,
      });
      setWeight(metricsData);
      alert("metric weights updated successfully!");
    } catch (error) {
      console.error("Error submitting weights:", error);
      alert("Failed to update weights.");
    }
  };

  const [tooltipContent, setTooltipContent] = useState({}); // To store tooltip content

  // Function to fetch metric content based on the metric ID
  const fetchMetricsContent = async (metricId) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/app/metrics/?id=${metricId}`
      );
      const data = response.data[0];
      setModalInfo({ show: true, content: data.description });
    } catch (error) {
      console.error("Failed to fetch metric data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = (content) => {
    return content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Function to fetch indicator content based on the indicator ID
  const fetchIndicatorContent = async (indicatorId) => {
    try {
      // Make sure to replace the URL with the correct endpoint if necessary
      const response = await axios.get(
        `${SERVER_URL}/app/indicators/?id=${indicatorId}`
      );
      console.log(response.data);
      const data = response.data[0]; // Assuming the response is an array with one object
      setTooltipContent((prev) => ({
        ...prev,
        [indicatorId]: data.description + "\n" + "Data Source: " + data.source,
      }));
    } catch (error) {
      console.error("Failed to fetch indicator data:", error);
    } finally {
      setLoading(false);
    }
  };

  //checking weight
  const handleFillWeight = async () => {
    const indicatorsPreferencesURL = `${SERVER_URL}/app/listpreference/listindicators/`;
    const metricsPreferencesURL = `${SERVER_URL}/app/listpreference/listmetrics/`;

    try {
      setLoading(true);
      const response = await axios.get(indicatorsPreferencesURL, {
        withCredentials: true,
      });
      const userWeights = response.data;

      const updatedWeights = { ...weights }; // Make a shallow copy of the current weights
      userWeights.forEach(({ metric, indicator, custom_weight }) => {
        updatedWeights[`indicator_${metric}_${indicator}`] = custom_weight; // Update the weight
      });

      const metricsResponse = await axios.get(metricsPreferencesURL, {
        withCredentials: true,
      });
      const userMetricsWeights = metricsResponse.data;
      userMetricsWeights.forEach(({ framework, metric, custom_weight }) => {
        if (framework === currentFramework) {
          updatedWeights[`metric_${metric}`] = custom_weight; // Update the weight
        }
      });

      setWeights(updatedWeights); // Set the updated weights back to the state
    } catch (error) {
      console.error("Failed to fetch and apply weights:", error);
      alert("Failed to fetch or No saved weights.");
    } finally {
      setLoading(false);
    }
  };

  // Function to convert text with '\n' into an array of JSX elements with <br/>
  const renderTextWithLineBreaks = (text) => {
    return text.split("\n").map((line, index, array) => (
      <span key={index}>
        {line}
        {index !== array.length - 1 && <br />}
      </span>
    ));
  };

  const toggleSubMetrics = (id) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      E: {
        ...prevCategories.E,
        metrics: toggleMetricOpen(prevCategories.E.metrics, id),
      },
      S: {
        ...prevCategories.S,
        metrics: toggleMetricOpen(prevCategories.S.metrics, id),
      },
      G: {
        ...prevCategories.G,
        metrics: toggleMetricOpen(prevCategories.G.metrics, id),
      },
    }));
  };

  const toggleSelection = (id, isSubMetric = false, subMetricId = null) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      E: {
        ...prevCategories.E,
        metrics: toggleMetricSelection(
          prevCategories.E.metrics,
          id,
          isSubMetric,
          subMetricId
        ),
      },
      S: {
        ...prevCategories.S,
        metrics: toggleMetricSelection(
          prevCategories.S.metrics,
          id,
          isSubMetric,
          subMetricId
        ),
      },
      G: {
        ...prevCategories.G,
        metrics: toggleMetricSelection(
          prevCategories.G.metrics,
          id,
          isSubMetric,
          subMetricId
        ),
      },
    }));
  };

  // Helper function to toggle the isOpen property of metrics
  const toggleMetricOpen = (metrics, id) => {
    return metrics.map((metric) =>
      metric.id === id ? { ...metric, isOpen: !metric.isOpen } : metric
    );
  };

  // Helper function to toggle the isSelected property of metrics and sub-metrics
  const toggleMetricSelection = (metrics, id, isSubMetric, subMetricId) => {
    return metrics.map((metric) => {
      if (metric.id === id) {
        if (!isSubMetric) {
          return { ...metric, isSelected: !metric.isSelected };
        } else {
          return {
            ...metric,
            subMetrics: metric.subMetrics.map((subMetric) =>
              subMetric.id === subMetricId
                ? { ...subMetric, isSelected: !subMetric.isSelected }
                : subMetric
            ),
          };
        }
      }
      return metric;
    });
  };

  // Function to calculate metric scores based on selected metrics, company, framework, and year
  const calculateMetricsScores = async () => {
    // Extract IDs of selected metrics
    const selectedMetrics = Object.values(categories).flatMap((category) =>
      category.metrics
        .filter((metric) => metric.isSelected)
        .map((metric) => metric.id)
    );
    setSelectedMetrics(selectedMetrics);
    setLoading(true);

    try {
      // API call to fetch metric scores based on selected metrics, company, framework, and selected year
      const url = `${SERVER_URL}/app/metricsdatavalue/?companies=${selectedCompany}&framework=${currentFramework}&metrics=${selectedMetrics.join(
        "&metrics="
      )}&year=${selectedYear}`;

      const response = await axios.get(url, { withCredentials: true });
      const data = response.data.data; // Assuming the API response structure as described
      console.log(data);

      // Initialize an object to store scores for the selected year
      const scores = {};

      // Iterate over each company's data (assuming multiple companies could be included)
      data.forEach((company) => {
        // Filter out the metric scores for the selected year and update the scores object
        company.metrics_scores.forEach((metric) => {
          scores[metric.metric_id] =
            metric.score * weights[`metric_${metric.metric_id}`];
          console.log(metric.score);
          console.log(weights[`metric_${metric.metric_id}`]);
        });
      });

      // Update the state with the filtered scores
      setMetricScores(scores);
    } catch (error) {
      console.error("Error fetching metric scores:", error);
      alert("Failed to fetch metric scores.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="metrics-card">
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" role="status"></Spinner>
            </div>
          ) : (
            <>
              <Card.Title>Indicators</Card.Title>
              <Button
                onClick={handleFillWeight}
                variant="info"
                className="metrics-fill"
              >
                Load Saved Weights
              </Button>
              <br />
              {Object.entries(categories).map(([key, value]) => (
                <>
                  <Button variant="link" onClick={() => toggleCategory(key)}>
                    {key === "E"
                      ? "Environmental Risk"
                      : key === "S"
                      ? "Social Risk"
                      : "Governance Risk"}
                  </Button>
                  <br />
                  <Collapse in={value.open}>
                    <ListGroup>
                      {value.metrics.map((metric) => (
                        <ListGroup.Item key={metric.id} className="metric-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <Form.Check
                              type="checkbox"
                              checked={metric.isSelected}
                              onChange={() => toggleSelection(metric.id)}
                              label={metric.title}
                            />
                            <div className="d-flex align-items-center">
                              <Form.Control
                                key={`indicator_${metric.id}`}
                                className="weight-input"
                                type="number"
                                value={weights[`metric_${metric.id}`]}
                                onChange={(e) =>
                                  handleWeightChange(
                                    `metric_${metric.id}`,
                                    e.target.value
                                  )
                                }
                              />
                              <Button
                                onClick={() => toggleSubMetrics(metric.id)}
                                size="sm"
                                style={{ marginLeft: "10px" }}
                              >
                                {metric.isOpen
                                  ? "Hide Metrics"
                                  : "Show Metrics"}
                              </Button>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip>
                                    {loading
                                      ? "Loading..."
                                      : tooltipContent[metric.id] ||
                                        "Click to view indicator's information"}
                                  </Tooltip>
                                }
                              >
                                <span
                                  className="info-icon"
                                  onClick={() => fetchMetricsContent(metric.id)}
                                >
                                  !
                                </span>
                              </OverlayTrigger>
                              <div>
                                {/* Displaying metric score */}
                                <span className="metric-score">
                                  Score:{" "}
                                  {metricScores[metric.id] >= 0
                                    ? metricScores[metric.id].toFixed(4)
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Collapse in={metric.isOpen}>
                            <div>
                              <ListGroup variant="flush">
                                {metric.subMetrics.map((subMetric) => (
                                  <ListGroup.Item
                                    key={subMetric.id}
                                    className="d-flex align-items-center justify-content-between pe-3"
                                  >
                                    <div className="metric-display">
                                      <div className="label-container">
                                        <span className="label-title">
                                          {subMetric.title}
                                        </span>
                                        <span className="label-value">
                                          {subMetric.value}
                                        </span>
                                        <span className="label-unit">
                                          {subMetric.unit}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <Form.Control
                                        key={`indicator_${metric.id}_${subMetric.id}`}
                                        className="weight-input"
                                        type="number"
                                        value={
                                          weights[
                                            `indicator_${metric.id}_${subMetric.id}`
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleWeightChange(
                                            `indicator_${metric.id}_${subMetric.id}`,
                                            e.target.value
                                          )
                                        }
                                      />
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={
                                          <Tooltip>
                                            {loading
                                              ? "Loading..."
                                              : renderTextWithLineBreaks(
                                                  tooltipContent[
                                                    subMetric.id
                                                  ] ||
                                                    "click to view metric's information"
                                                )}
                                          </Tooltip>
                                        }
                                      >
                                        <span
                                          className="info-icon me-3"
                                          onClick={() =>
                                            fetchIndicatorContent(subMetric.id)
                                          }
                                        >
                                          !
                                        </span>
                                      </OverlayTrigger>
                                    </div>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </div>
                          </Collapse>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Collapse>
                </>
              ))}
              <Button variant="success" onClick={handleSubmitAllWeights}>
                Save Weights Changes
              </Button>
              <Button
                variant="primary"
                onClick={calculateMetricsScores}
                style={{ marginLeft: "10px" }}
              >
                Calculate Indicators Score
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
      <Modal
        show={modalInfo.show}
        onHide={() => setModalInfo({ ...modalInfo, show: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Metric Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderModalContent(modalInfo.content)}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setModalInfo({ ...modalInfo, show: false })}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MetricsCard;
