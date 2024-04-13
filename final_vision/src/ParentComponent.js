// ParentComponent.js
import React, { useState } from "react";
import FrameworkChoose from "./FrameworkChoose";
import MetricsCard from "./MetricsCard";

const ParentComponent = () => {
  const [currentFrameworkId, setCurrentFrameworkId] = useState(null);

  return (
    <div>
      <FrameworkChoose setFramework={setCurrentFrameworkId} />
      {currentFrameworkId && (
        <MetricsCard currentFramework={currentFrameworkId} />
      )}
    </div>
  );
};

export default ParentComponent;
