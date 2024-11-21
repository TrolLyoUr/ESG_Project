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
  setFramework: (frameworkId: number) => void;
}

const FrameworkChoose: React.FC<FrameworkChooseProps> = ({ setFramework }) => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [activeDescriptionId, setActiveDescriptionId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/app/frameworks/`);
        setFrameworks(response.data);
      } catch (error) {
        console.error("Failed to fetch frameworks:", error);
      }
    };

    fetchFrameworks();
  }, []);

  const toggleDescription = (id: number) => {
    setActiveDescriptionId(activeDescriptionId === id ? null : id);
  };

  const handleFrameworkSelection = (frameworkId: number) => {
    setFramework(frameworkId);
    setActiveDescriptionId(null);
  };

  const renderDescription = (description: string) => {
    return description.split(/\r?\n/).map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="framework-choose">
      {frameworks.map((framework) => (
        <div key={framework.id} className="framework-item">
          <button onClick={() => handleFrameworkSelection(framework.id)}>
            {framework.name}
          </button>
          <span
            className="triangle-icon"
            onClick={() => toggleDescription(framework.id)}
          >
            ▼
          </span>
          {activeDescriptionId === framework.id && (
            <div className="framework-description">
              {renderDescription(framework.description)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FrameworkChoose;
