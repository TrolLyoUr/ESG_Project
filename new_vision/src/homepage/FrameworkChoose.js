// FrameworkChoose.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FrameworkChoose.css";
import { SERVER_URL } from "./config"; // Importing the URL from configuration

// Configure axios to send credentials (such as cookies) with each request
axios.defaults.withCredentials = true;

/**
 * Component to choose a framework from a list fetched from the server.
 * @param {function} setFramework - Function to set the selected framework in the parent component.
 */
const FrameworkChoose = ({ setFramework }) => {
  const [frameworks, setFrameworks] = useState([]); // State to hold the list of frameworks
  const [activeDescriptionId, setActiveDescriptionId] = useState(null); // State to manage the visibility of framework descriptions

  // Effect to fetch frameworks from the server on component mount
  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/app/frameworks/`);
        setFrameworks(response.data); // Populate frameworks state with data from server
      } catch (error) {
        console.error("Failed to fetch frameworks:", error); // Log errors if the request fails
      }
    };

    fetchFrameworks();
  }, []);

  /**
   * Toggles the visibility of the framework description.
   * @param {number} id - The ID of the framework to toggle.
   */
  const toggleDescription = (id) => {
    setActiveDescriptionId(activeDescriptionId === id ? null : id);
  };

  /**
   * Handles selecting a framework.
   * @param {number} frameworkId - The ID of the selected framework.
   */
  const handleFrameworkSelection = (frameworkId) => {
    setFramework(frameworkId); // Update the selected framework in the parent component
    setActiveDescriptionId(null); // Close the description view
  };

  /**
   * Renders a framework description with line breaks.
   * @param {string} description - The description text of the framework.
   * @returns {Array} - A React fragment containing the description split by lines.
   */
  const renderDescription = (description) => {
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
