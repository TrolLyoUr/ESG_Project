import React, { useState, useEffect } from 'react';
import './TotalScore.css';
import { SERVER_URL } from "./config"; 

const frameworkMapping = {
  4: 'GRI',
  5: 'SASB',
  6: 'TCFD'
};

const TotalScore = ({ companyId, year, frameworkId }) => {
  const [esgScore, setEsgScore] = useState(null);

  useEffect(() => {
    if (companyId && year && frameworkId) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${SERVER_URL}/app/calculateperformance?company=${companyId}&scale=1`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

         
                    
          // 假设 data 直接包含了框架数据，如 data.GRI 或 data.SASB
         

          const data = await response.json();
          console.log("Complete data from backend:", data); // 输出完整的后端数据以供检查

          const frameworkName = frameworkMapping[frameworkId];
          console.log("Using framework:", frameworkName); // 确认使用的框架名称

          const yearData = data[frameworkName];// 根据框架名从 result 对象中获取数据
          console.log("Year data for framework:", yearData); // 输出对应框架的年份数据

          const score = yearData && yearData[year] !== undefined ? yearData[year].toFixed(3) : null;
          console.log("Resolved ESG score for the year:", score); // 输出解析出的 ESG 分数

          setEsgScore(score);

        } catch (error) {
          console.error('Error fetching data:', error);
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
      <h1>ESG Score: {esgScore !== null ? esgScore : 'Unavailable'}</h1>
    </div>
  );
};

export default TotalScore;
