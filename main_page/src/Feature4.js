import React, { useState, useEffect } from "react";
import "./Feature4.css";
import axios from "axios";

const Feature4 = ({ selectedId }) => {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiURL = `http://127.0.0.1:8000/app/frameworks/${selectedId}/metrics/`;
        const response = await axios.get(apiURL, { withCredentials: true });

        if (response.data) {
          // Adjust here to accommodate metric indicators in the response structure
          const metricsData = response.data.map((item) => ({
            ...item.metric,
            predefined_weight: item.predefined_weight,
            selected: false,
            weight: item.predefined_weight, // Use predefined weight as initial weight
            indicatorsVisible: false, // Add a new state to manage indicators visibility
          }));
          setMetrics(metricsData);
        } else {
          console.error("Failed to fetch metrics:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      }
    };

    if (selectedId) {
      fetchMetrics();
    }
  }, [selectedId]);

  const handleSelectAndToggleIndicators = (id) => {
    setMetrics(
      metrics.map((metric) =>
        metric.id === id
          ? {
              ...metric,
              selected: !metric.selected, // Toggle the selected state
              indicatorsVisible: !metric.indicatorsVisible, // Toggle the visibility of indicators
            }
          : metric
      )
    );
  };

  const handleWeightChange = (id, e) => {
    e.stopPropagation();
    const newWeight = Math.max(0, Math.min(Number(e.target.value), 1));

    const totalOtherWeights = metrics.reduce(
      (total, metric) =>
        metric.id !== id && metric.selected ? total + metric.weight : total,
      0
    );

    if (totalOtherWeights + newWeight <= 1) {
      setMetrics(
        metrics.map((metric) =>
          metric.id === id ? { ...metric, weight: newWeight } : metric
        )
      );
    } else {
      alert("Selected metrics total weight cannot exceed 1.");
    }
  };

  const handleIndicatorWeightChange = (metricId, indicatorId, e) => {
    e.stopPropagation(); // Prevent the metric selection toggle when adjusting the weight
    const newWeight = Math.max(0, Math.min(Number(e.target.value), 1)); // Ensure the weight is between 0 and 1

    setMetrics(
      metrics.map((metric) => {
        if (metric.id === metricId) {
          // Update the weight of the specific indicator within the metric
          const updatedIndicators = metric.metric_indicators.map((indicator) =>
            indicator.indicator.id === indicatorId
              ? { ...indicator, weight: newWeight }
              : indicator
          );

          return { ...metric, metric_indicators: updatedIndicators };
        }
        return metric;
      })
    );
  };

  return (
    <div className="feature-area-4">
      <ul>
        {metrics.map((metric) => (
          <li
            key={metric.id}
            className={`metric-item ${metric.selected ? "selected" : ""}`}
            onClick={() => handleSelectAndToggleIndicators(metric.id)}
          >
            <div>{metric.name}</div>
            {metric.selected && (
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={metric.weight}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleWeightChange(metric.id, e)}
                style={{ marginLeft: "10px" }}
                className="weight-input"
              />
            )}
            {metric.indicatorsVisible && (
              <ul className="indicator-list">
                {metric.metric_indicators.map((indicator) => (
                  <li key={indicator.indicator.id} className="indicator-item">
                    {indicator.indicator.name} (Predefined Weight:{" "}
                    {indicator.predefined_weight})
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={indicator.weight || indicator.predefined_weight} // Use current weight if available, otherwise fall back to predefined weight
                      onChange={(e) =>
                        handleIndicatorWeightChange(
                          metric.id,
                          indicator.indicator.id,
                          e
                        )
                      }
                      style={{ marginLeft: "10px" }}
                      className="weight-input"
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feature4;
