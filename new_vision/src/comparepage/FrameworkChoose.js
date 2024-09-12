import React from "react";
import "./FrameworkChoose.css";

const FrameworkChoose = ({ setFramework }) => {
  const frameworks = [
    { name: "GRI", id: 1 },
    { name: "SASB", id: 2 },
    { name: "TCFD", id: 3 },
  ];

  return (
    <div className="second_framework-choose">
      {frameworks.map((framework) => (
        <button key={framework.name} onClick={() => setFramework(framework.id)}>
          {framework.name}
        </button>
      ))}
    </div>
  );
};

export default FrameworkChoose;
