import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FrameworkChoose.css";
import { SEVER_URL } from "./config";

const serverUrl = SEVER_URL;

const FrameworkChoose = ({ setFramework }) => {
  const [frameworks, setFrameworks] = useState([]);
  const [activeDescriptionId, setActiveDescriptionId] = useState(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await axios.get(`${serverUrl}/app/frameworks/`);
        setFrameworks(response.data); // Set frameworks based on the API response
      } catch (error) {
        console.error("Failed to fetch frameworks:", error);
      }
    };

    fetchFrameworks();
  }, []);

  const toggleDescription = (id) => {
    setActiveDescriptionId(activeDescriptionId === id ? null : id); // Toggle active description
  };

  const renderDescription = (description) => {
    // Split the description by line breaks and render each line separately
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
          <button onClick={() => setFramework(framework.id)}>
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
