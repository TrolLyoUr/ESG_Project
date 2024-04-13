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
} from "react-bootstrap";
import axios from "axios";
import { SERVER_URL } from "./config";

import "./MetricsCard.css";

const MetricsCard = ({ currentFramework }) => {
  const [metrics, setMetrics] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${SERVER_URL}/app/frameworks/${currentFramework}/metrics/`
        );
        setMetrics(
          response.data.map(
            (metric) => (
              console.log(metric),
              {
                id: metric.metric.id,
                title: metric.metric.name,
                isSelected: true,
                isOpen: false,
                subMetrics: metric.metric.metric_indicators.map(
                  (indicator) => ({
                    id: indicator.indicator.id,
                    title: indicator.indicator.name,
                    isSelected: true,
                    weight: indicator.predefined_weight,
                  })
                ),
                weight: metric.predefined_weight,
              }
            )
          )
        );
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

  const [tooltipContent, setTooltipContent] = useState({}); // 存储每个提示的内容

  const fetchMetrcisContent = async (id) => {
    setLoading(true);
    try {
      // 示例 URL，请根据实际情况替换
      const response = await fetch(`https://your-backend.com/data?id=${id}`);
      const data = await response.json();
      // 假设后端返回的数据有一个 `content` 字段
      setTooltipContent((prev) => ({ ...prev, [id]: data.content }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }; // 用于存储提示内容

  const fetchIndicatorContent = async (id) => {
    setLoading(true);
    try {
      // 示例 URL，请根据实际情况替换
      const response = await fetch(`https://your-backend.com/data?id=${id}`);
      const data = await response.json();
      // 假设后端返回的数据有一个 `content` 字段
      setTooltipContent((prev) => ({ ...prev, [id]: data.content }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }; // 用于存储提示内容

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

                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      {loading
                        ? "Loading..."
                        : tooltipContent[metric.id] ||
                          "Default tooltip content"}
                    </Tooltip>
                  }
                >
                  <span
                    className="info-icon"
                    onClick={() => fetchMetrcisContent(metric.id)}
                  >
                    !
                  </span>
                </OverlayTrigger>
                <div>
                  <Form.Control
                    type="number"
                    value={metric.weight === null ? "" : metric.weight}
                    onChange={(e) => updateWeight(metric.id, e.target.value)}
                  />
                  {errors[metric.id] && (
                    <Alert variant="danger">Invalid weight (0-10)</Alert>
                  )}
                  <Button
                    onClick={() => toggleSubMetrics(metric.id)}
                    size="sm"
                    style={{ marginLeft: "10px" }}
                  >
                    {metric.isOpen ? "Hide Metrics" : "Show Metrics"}
                  </Button>
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
                        {/* Checkbox for sub-metric selection */}
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
                                {subMetric.score}
                              </span>
                            </div>
                          }
                          className="me-4" // More right margin
                        />
                        <div className="d-flex align-items-center">
                          {/* Overlay Trigger for tooltips */}
                          <Form.Control
                            type="number"
                            value={metric.weight === null ? "" : metric.weight}
                            onChange={(e) =>
                              updateWeight(metric.id, e.target.value)
                            }
                          />
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {loading
                                  ? "Loading..."
                                  : tooltipContent[metric.id] ||
                                    "Default tooltip content"}
                              </Tooltip>
                            }
                          >
                            {/* Information icon with click event */}
                            <span
                              className="info-icon me-3"
                              onClick={() => fetchIndicatorContent(metric.id)}
                            >
                              !
                            </span>
                          </OverlayTrigger>
                          {/* Numeric input for updating weight */}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              </Collapse>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default MetricsCard;
