import React, { useState, useEffect } from "react";
import "./TotalScore.css";
import { SERVER_URL } from "./config";

const frameworkMapping = {
  4: "GRI",
  5: "SASB",
  6: "TCFD",
};

const TotalScore = ({ companyId, year, frameworkId }) => {
  const [esgScore, setEsgScore] = useState(null);

  useEffect(() => {
    if (companyId && year && frameworkId) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${SERVER_URL}/app/calculateperformance?company=${companyId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();

          const frameworkName = frameworkMapping[frameworkId];

          const yearData = data[frameworkName]; // 根据框架名从 result 对象中获取数据

          const score =
            yearData && yearData[year] !== undefined
              ? yearData[year]["total_score"].toFixed(3)
              : null;

          setEsgScore(score);
        } catch (error) {
          console.error("Error fetching data:", error);
          setEsgScore(null);
        }
      };

      fetchData();
    } else {
      console.log("Missing parameters: companyId, year, or frameworkId"); // 如果参数缺失，输出提示
      setEsgScore(null);
    }
  }, [companyId, year, frameworkId]);

  return (
    <div className="total-score">
      <h1>ESG Score: {esgScore !== null ? esgScore : "Unavailable"}</h1>
    </div>
  );
};

export default TotalScore;
