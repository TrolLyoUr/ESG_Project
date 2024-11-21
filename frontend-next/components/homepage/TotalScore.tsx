import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "@/lib/config";

interface TotalScoreProps {
  companyId: string;
  year: string;
  frameworkId: string;
  weight: number;
}

// Mapping of framework IDs to their string representations
const frameworkMapping: Record<number, string> = {
  1: "GRI",
  2: "SASB",
  3: "TCFD",
};

const TotalScore: React.FC<TotalScoreProps> = ({
  companyId,
  year,
  frameworkId,
  weight,
}) => {
  const [esgScore, setEsgScore] = useState<number | null>(null);

  useEffect(() => {
    if (companyId && year && frameworkId) {
      const fetchData = async () => {
        try {
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

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          const frameworkName = frameworkMapping[Number(frameworkId)];
          const yearData = data[frameworkName];

          const score =
            yearData && yearData[year] !== undefined
              ? Number(yearData[year]["total_score"].toFixed(3))
              : null;
          setEsgScore(score);
        } catch (error) {
          console.error("Error fetching data:", error);
          setEsgScore(null);
        }
      };

      fetchData();
    } else {
      console.log("Missing parameters: companyId, year, or frameworkId");
      setEsgScore(null);
    }
  }, [companyId, year, frameworkId, weight]);

  return (
    <div className="total-score">
      <h1>ESG Score: {esgScore !== null ? esgScore : "Unavailable"}</h1>
    </div>
  );
};

export default TotalScore;
