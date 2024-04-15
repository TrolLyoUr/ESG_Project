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
} from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { SERVER_URL } from "./config";
import "./MetricsCard.css";

const csrftoken = Cookies.get("csrftoken");
axios.defaults.headers.common["X-CSRFToken"] = csrftoken;

const MetricsCard = ({ currentFramework }) => {
  const [metrics, setMetrics] = useState([]);
  const [errors, setErrors] = useState({});
  const [modalInfo, setModalInfo] = useState({ show: false, content: "" });
  const [weights, setWeights] = useState({}); // To store all weights
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
          isSelected: true,
          isOpen: false,
          subMetrics: metric.metric.metric_indicators.map((indicator) => ({
            id: indicator.indicator.id,
            title: indicator.indicator.name,
            isSelected: true,
            weight: indicator.predefined_weight,
          })),
          weight: metric.predefined_weight,
        }));

        setMetrics(newMetrics);
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
        console.error("Failed to fetch metrics:", error);
        setErrors({ global: "Failed to load metrics" });
      } finally {
        setLoading(false);
      }
    };

    if (currentFramework) {
      fetchMetrics();
    }
  }, [currentFramework]);

  const handleWeightChange = (key, value) => {
    setWeights({ ...weights, [key]: value });
  };

  const handleSubmitAllWeights = async () => {
    // Prepare data for API requests
    const indicatorsData = [];
    const metricsData = [];
    metrics.forEach((metric) => {
      if (weights[`metric_${metric.id}`] !== undefined) {
        metricsData.push({
          // user: 1, // Assuming the user ID is 1
          metric: metric.id,
          framework: currentFramework, // assuming the framework ID is stored in each metric
          custom_weight: parseFloat(weights[`metric_${metric.id}`]),
        });
      }
      metric.subMetrics.forEach((subMetric) => {
        if (weights[`indicator_${metric.id}_${subMetric.id}`] !== undefined) {
          indicatorsData.push({
            // user: 1, // Assuming the user ID is 1
            metric: metric.id,
            indicator: subMetric.id,
            custom_weight: parseFloat(
              weights[`indicator_${metric.id}_${subMetric.id}`]
            ),
          });
        }
      });
    });

    // Call APIs
    try {
      console.log(metricsData);
      console.log(indicatorsData);
      await axios.post(`${SERVER_URL}/app/saveindicator/`, indicatorsData, {
        withCredentials: true,
      });
      await axios.post(`${SERVER_URL}/app/savemetrics/`, metricsData, {
        withCredentials: true,
      });
      alert("Weights updated successfully!");
    } catch (error) {
      console.error("Error submitting weights:", error);
      alert("Failed to update weights.");
    }
  };

  const [tooltipContent, setTooltipContent] = useState({}); // 存储每个提示的内容

  const fetchMetricsContent = async (metricId) => {
    setLoading(true);
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

  const fetchIndicatorContent = async (indicatorId) => {
    setLoading(true);
    try {
      // Make sure to replace the URL with the correct endpoint if necessary
      const response = await axios.get(
        `${SERVER_URL}/app/indicators/?id=${indicatorId}`,
        { withCredentials: true }
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

  // Function to convert text with '\n' into an array of JSX elements with <br/>
  const renderTextWithLineBreaks = (text) => {
    return text.split("\n").map((line, index, array) => (
      <span key={index}>
        {line}
        {index !== array.length - 1 && <br />}
      </span>
    ));
  };

  // 定义 toggleSubMetrics 函数，用于切换小数据的显示/隐藏
  const toggleSubMetrics = (id) => {
    setMetrics((metrics) =>
      metrics.map((metric) =>
        metric.id === id ? { ...metric, isOpen: !metric.isOpen } : metric
      )
    );
  };

  // 定义 updateWeight 函数，用于更新权重
  const updateWeight = (
    id,
    newWeight,
    isSubMetric = false,
    subMetricId = null
  ) => {
    const weight = newWeight === "" ? null : parseInt(newWeight, 10);
    const isValid = weight === null || (weight >= 0 && weight <= 10);
    let foundInvalid = !isValid; // 用于检查是否发现无效输入

    setMetrics(
      metrics.map((metric) => {
        if (metric.id === id) {
          if (!isSubMetric) {
            return { ...metric, weight: isValid ? weight : metric.weight };
          } else {
            const updatedSubMetrics = metric.subMetrics.map((subMetric) => {
              if (subMetric.id === subMetricId) {
                return {
                  ...subMetric,
                  weight: isValid ? weight : subMetric.weight,
                };
              }
              return subMetric;
            });
            return { ...metric, subMetrics: updatedSubMetrics };
          }
        }
        return metric;
      })
    );
  };

  const toggleSelection = (id, isSubMetric = false, subMetricId = null) => {
    setMetrics(
      metrics.map((metric) => {
        if (metric.id === id) {
          if (!isSubMetric) {
            // Toggle the selection of the main metric
            return { ...metric, isSelected: !metric.isSelected };
          } else {
            // Toggle the selection of a sub-metric
            const updatedSubMetrics = metric.subMetrics.map((subMetric) => {
              if (subMetric.id === subMetricId) {
                return { ...subMetric, isSelected: !subMetric.isSelected };
              }
              return subMetric;
            });
            return { ...metric, subMetrics: updatedSubMetrics };
          }
        }
        return metric;
      })
    );
    // Optional: Send the selection status to the backend
  };

  return (
    <>
      <Card className="metrics-card">
        <Card.Body>
          <Card.Title>Indicators</Card.Title>
          <ListGroup>
            {metrics.map((metric) => (
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
                      {metric.isOpen ? "Hide Metrics" : "Show Metrics"}
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
                          <Form.Check
                            type="checkbox"
                            checked={subMetric.isSelected}
                            onChange={() =>
                              toggleSelection(metric.id, true, subMetric.id)
                            }
                            label={
                              <div className="label-container">
                                <span className="label-title">
                                  {subMetric.title}
                                </span>
                                <span className="label-score">
                                  {/* {subMetric.score} */}
                                </span>
                                <span className="label-score">
                                  {/* {subMetric.unit} */}
                                </span>
                              </div>
                            }
                            className="me-4"
                          />
                          <div className="d-flex align-items-center">
                            <Form.Control
                              className="weight-input"
                              type="number"
                              value={
                                weights[
                                  `indicator_${metric.id}_${subMetric.id}`
                                ]
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
                                        tooltipContent[subMetric.id] ||
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
          <Button variant="success" onClick={handleSubmitAllWeights}>
            Save Weights Changes
          </Button>
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
