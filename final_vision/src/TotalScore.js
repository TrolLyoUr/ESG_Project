import React, { useState, useEffect } from 'react';
import './TotalScore.css'; // 引入CSS文件

const TotalScore = ({ dataPacket }) => {
  const [numbers, setNumbers] = useState([null, null, null]);
  const [average, setAverage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/process-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataPacket)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setNumbers([
          data.number1 || null,
          data.number2 || null,
          data.number3 || null
        ]);
        const validNumbers = [data.number1, data.number2, data.number3].filter(n => n !== null);
        const sum = validNumbers.reduce((acc, curr) => acc + curr, 0);
        const avg = validNumbers.length > 0 ? (sum / validNumbers.length).toFixed(2) : null;
        setAverage(avg);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNumbers([null, null, null]);
        setAverage(null);
      }
    };

    fetchData();
  }, [dataPacket]); // 依赖于 dataPacket 的变化

  const labels = ['E', 'S', 'G']; // Labels for each small number

  return (
    <div className="total-score">
      <div className="average">
        <h1>ESG: {average !== null ? average : 'null'}</h1>
      </div>
      <div className="numbers">
        {numbers.map((num, index) => (
          <div key={index} className="number-small">
            {labels[index]}: {num !== null ? num : 'null'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalScore;


