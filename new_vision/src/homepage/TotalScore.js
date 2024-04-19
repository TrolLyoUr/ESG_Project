import React, { useState, useEffect } from "react";
import "./TotalScore.css";
import { SERVER_URL } from "./config";
import axios from "axios";

// Mapping of framework IDs to their string representations for easy reference.
const frameworkMapping = {
  4: "GRI",
  5: "SASB",
  6: "TCFD",
};

// Configuration to send cookies with axios requests, needed for secure API calls.
axios.defaults.withCredentials = true;

/**
 * The TotalScore component fetches and displays the ESG (Environmental, Social, and Governance)
 * score for a specified company, year, and ESG framework. It uses a REST API to retrieve the score
 * and displays it in a styled component.
 *
 * Props:
 *  - companyId (number): The unique identifier of the company.
 *  - year (number): The year for which the ESG score is desired.
 *  - frameworkId (number): The ID corresponding to an ESG framework (e.g., GRI, SASB, TCFD).
 */
const TotalScore = ({ companyId, year, frameworkId }) => {
  const [esgScore, setEsgScore] = useState(null); // State to hold the fetched ESG score.

  useEffect(() => {
    // Ensure all necessary data is present before making the API call.
    if (companyId && year && frameworkId) {
      const fetchData = async () => {
        try {
          // Construct the request URL and perform the fetch operation.
          const response = await fetch(
            `${SERVER_URL}/app/calculateperformance?company=${companyId}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // Check if the response was successful.
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          const frameworkName = frameworkMapping[frameworkId]; // Translate frameworkId to its name.
          const yearData = data[frameworkName]; // Access the data specific to the selected framework.

          // Calculate the score and format it, or set it to null if unavailable.
          const score =
            yearData && yearData[year] !== undefined
              ? yearData[year]["total_score"].toFixed(3)
              : null;
          setEsgScore(score);
        } catch (error) {
          console.error("Error fetching data:", error);
          setEsgScore(null); // Handle errors by resetting the ESG score.
        }
      };

      fetchData();
    } else {
      // Log an error message if required props are not provided.
      console.log("Missing parameters: companyId, year, or frameworkId");
      setEsgScore(null);
    }
  }, [companyId, year, frameworkId]); // Dependency array to trigger the effect when these values change.

  // Render the ESG score or a message indicating unavailability.
  return (
    <div className="total-score">
      <h1>ESG Score: {esgScore !== null ? esgScore : "Unavailable"}</h1>
    </div>
  );
};

export default TotalScore;
