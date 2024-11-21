"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "@/lib/config";

interface Framework {
  id: number;
  name: string;
  description: string;
}

interface FrameworkChooseProps {
  setFramework: (id: number) => void;
  initialFramework?: number;
}

const defaultFrameworks: Framework[] = [
  { id: 1, name: "GRI", description: "Global Reporting Initiative" },
  {
    id: 2,
    name: "SASB",
    description: "Sustainability Accounting Standards Board",
  },
  {
    id: 3,
    name: "TCFD",
    description: "Task Force on Climate-related Financial Disclosures",
  },
];

const FrameworkChoose: React.FC<FrameworkChooseProps> = ({
  setFramework,
  initialFramework = 1,
}) => {
  const [frameworks, setFrameworks] = useState<Framework[]>(defaultFrameworks);
  const [selectedFramework, setSelectedFramework] =
    useState<number>(initialFramework);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await axios.get<Framework[]>(
          `${SERVER_URL}/app/frameworks/`,
          {
            withCredentials: true,
          }
        );

        if (response.data && response.data.length > 0) {
          setFrameworks(response.data);
        }
      } catch (err) {
        console.error("Error fetching frameworks:", err);
        setError("Failed to load frameworks");
        // Fallback to default frameworks
        setFrameworks(defaultFrameworks);
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  const handleFrameworkSelect = (id: number) => {
    setSelectedFramework(id);
    setFramework(id);
  };

  if (loading) {
    return (
      <div className="framework-choose-loading">
        <div className="loading-spinner"></div>
        Loading frameworks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="framework-choose-error">
        <p>{error}</p>
        <p>Using default frameworks</p>
      </div>
    );
  }

  return (
    <div className="framework-choose-container">
      <h2>Select Framework for Comparison</h2>
      <div className="framework-buttons">
        {frameworks.map((framework) => (
          <div
            key={framework.id}
            className="framework-button-wrapper"
            onMouseEnter={() => setShowTooltip(framework.id)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <button
              className={`framework-button ${
                selectedFramework === framework.id ? "selected" : ""
              }`}
              onClick={() => handleFrameworkSelect(framework.id)}
              aria-label={`Select ${framework.name} framework`}
            >
              {framework.name}
            </button>
            {showTooltip === framework.id && (
              <div className="framework-tooltip">{framework.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrameworkChoose;
