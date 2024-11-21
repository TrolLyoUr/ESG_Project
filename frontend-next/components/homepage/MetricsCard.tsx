"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "@/lib/config";
import type { Metric, SubMetric, Categories, CategoryState } from "@/types";

interface MetricsCardProps {
  currentFramework: string;
  selectedCompany: string;
  selectedYear: string;
  setSelectedMetrics: (metrics: string[]) => void;
  setWeight: (weight: number) => void;
}

interface MetricResponse {
  id: number;
  title: string;
  pillar: "E" | "S" | "G";
  weight: number;
  submetrics: {
    id: number;
    title: string;
    weight: number;
    value?: string;
    unit?: string;
    source?: string;
  }[];
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  currentFramework,
  selectedCompany,
  selectedYear,
  setSelectedMetrics,
  setWeight,
}) => {
  const [categories, setCategories] = useState<Categories>({
    E: { open: false, metrics: [] },
    S: { open: false, metrics: [] },
    G: { open: false, metrics: [] },
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentFramework || !selectedCompany || !selectedYear) return;

      try {
        const response = await axios.get(
          `${SERVER_URL}/app/metrics/?framework=${currentFramework}&company=${selectedCompany}&year=${selectedYear}`,
          { withCredentials: true }
        );

        const metricsData: MetricResponse[] = response.data;
        const newCategories: Categories = {
          E: { open: false, metrics: [] },
          S: { open: false, metrics: [] },
          G: { open: false, metrics: [] },
        };

        metricsData.forEach((metric) => {
          const formattedMetric: Metric = {
            id: metric.id,
            title: metric.title,
            isSelected: false,
            isOpen: false,
            pillar: metric.pillar,
            weight: metric.weight,
            subMetrics: metric.submetrics.map((sub) => ({
              id: sub.id,
              title: sub.title,
              weight: sub.weight,
              value: sub.value,
              unit: sub.unit,
              source: sub.source,
            })),
          };
          newCategories[metric.pillar].metrics.push(formattedMetric);
        });

        setCategories(newCategories);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, [currentFramework, selectedCompany, selectedYear]);

  const toggleCategory = (category: keyof Categories) => {
    setCategories((prev) => ({
      ...prev,
      [category]: { ...prev[category], open: !prev[category].open },
    }));
  };

  const toggleMetricOpen = (metrics: Metric[], id: number): Metric[] => {
    return metrics.map((metric) =>
      metric.id === id ? { ...metric, isOpen: !metric.isOpen } : metric
    );
  };

  const toggleMetricSelection = (
    metrics: Metric[],
    id: number,
    isSubMetric: boolean,
    subMetricId: number | null
  ): Metric[] => {
    return metrics.map((metric) => {
      if (metric.id === id) {
        if (isSubMetric && subMetricId !== null) {
          const updatedSubMetrics = metric.subMetrics.map((sub) => ({
            ...sub,
            isSelected:
              sub.id === subMetricId ? !sub.isSelected : sub.isSelected,
          }));
          return { ...metric, subMetrics: updatedSubMetrics };
        }
        return { ...metric, isSelected: !metric.isSelected };
      }
      return metric;
    });
  };

  const toggleSubMetrics = (id: number) => {
    setCategories((prev) => ({
      ...prev,
      E: {
        ...prev.E,
        metrics: toggleMetricOpen(prev.E.metrics, id),
      },
      S: {
        ...prev.S,
        metrics: toggleMetricOpen(prev.S.metrics, id),
      },
      G: {
        ...prev.G,
        metrics: toggleMetricOpen(prev.G.metrics, id),
      },
    }));
  };

  const toggleSelection = (
    id: number,
    isSubMetric = false,
    subMetricId: number | null = null
  ) => {
    setCategories((prev) => ({
      ...prev,
      E: {
        ...prev.E,
        metrics: toggleMetricSelection(
          prev.E.metrics,
          id,
          isSubMetric,
          subMetricId
        ),
      },
      S: {
        ...prev.S,
        metrics: toggleMetricSelection(
          prev.S.metrics,
          id,
          isSubMetric,
          subMetricId
        ),
      },
      G: {
        ...prev.G,
        metrics: toggleMetricSelection(
          prev.G.metrics,
          id,
          isSubMetric,
          subMetricId
        ),
      },
    }));
  };

  const renderTextWithLineBreaks = (text: string) => {
    return text.split("\n").map((line, index, array) => (
      <span key={index}>
        {line}
        {index !== array.length - 1 && <br />}
      </span>
    ));
  };

  const renderMetrics = (
    categoryMetrics: Metric[],
    pillar: keyof Categories
  ) => {
    return categoryMetrics.map((metric) => (
      <div key={metric.id} className="metric-item">
        <div className="metric-header">
          <input
            type="checkbox"
            checked={metric.isSelected}
            onChange={() => toggleSelection(metric.id)}
          />
          <span className="metric-title">{metric.title}</span>
          <button
            className={`toggle-button ${metric.isOpen ? "open" : ""}`}
            onClick={() => toggleSubMetrics(metric.id)}
          >
            {metric.isOpen ? "▼" : "▶"}
          </button>
        </div>
        {metric.isOpen && (
          <div className="sub-metrics">
            {metric.subMetrics.map((sub) => (
              <div key={sub.id} className="sub-metric-item">
                <input
                  type="checkbox"
                  checked={sub.isSelected}
                  onChange={() => toggleSelection(metric.id, true, sub.id)}
                />
                <span className="sub-metric-title">
                  {renderTextWithLineBreaks(sub.title)}
                </span>
                {sub.value && (
                  <span className="sub-metric-value">
                    {sub.value} {sub.unit}
                  </span>
                )}
                {sub.source && (
                  <span className="sub-metric-source">
                    Source: {sub.source}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="metrics-card">
      {Object.entries(categories).map(([category, { open, metrics }]) => (
        <div key={category} className="category-section">
          <div
            className="category-header"
            onClick={() => toggleCategory(category as keyof Categories)}
          >
            <span className="category-title">
              {category === "E"
                ? "Environmental"
                : category === "S"
                ? "Social"
                : "Governance"}
            </span>
            <button className={`toggle-button ${open ? "open" : ""}`}>
              {open ? "▼" : "▶"}
            </button>
          </div>
          {open && (
            <div className="metrics-list">
              {renderMetrics(metrics, category as keyof Categories)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsCard;
