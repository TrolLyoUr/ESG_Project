import React, { useState, useEffect } from 'react';
import './TotalScore.css'; // 引入CSS文件

const TotalScore = ({ companyName, year, frameworkId }) => {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await fetch(`https://api.example.com/scores?companyName=${encodeURIComponent(companyName)}&year=${year}&frameworkId=${frameworkId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setScore(data.score);
      } catch (error) {
        console.error('Error fetching score:', error);
        setScore('Error loading score');
      }
    };

    fetchScore();
  }, [companyName, year, frameworkId]); // 依赖项列表，当这些 props 变化时重新执行 effect

  return (
    <div className="total-score">
      {score !== null ? score : 'Loading...'}
    </div>
  );
};

export default TotalScore;
