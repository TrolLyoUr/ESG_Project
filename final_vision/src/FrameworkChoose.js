import React from 'react';
import './FrameworkChoose.css';

const FrameworkChoose = ({ setFramework }) => { 
  const frameworks = [
    { name: 'GRI', id: 4 },
    { name: 'SASB', id: 5 },
    { name: 'TCFD', id: 6 }
  ];

  return (
    <div className="framework-choose">
      {frameworks.map((framework) => (
        <button key={framework.name} onClick={() => setFramework(framework.id)}> 
          {framework.name}
        </button>
      ))}
    </div>
  );
};

export default FrameworkChoose;
