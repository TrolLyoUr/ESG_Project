import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FrameworkChoose from "./comparepage/FrameworkChoose";
import ComparisonTable from "./comparepage/ComparisonTable";

const ComparePage = () => {
  // Hooks for navigation and retrieving query parameters
  const location = useLocation();
  const navigate = useNavigate();

  // Extract company and year information from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const company1 = queryParams.get("company1");
  const year1 = queryParams.get("year1");
  const company2 = queryParams.get("company2");
  const year2 = queryParams.get("year2");
  const companyid1 = queryParams.get("companyid1");
  const companyid2 = queryParams.get("companyid2");

  // State to manage the selected framework
  const [framework, setFramework] = useState(4); // Assuming '4' is a default framework ID

  // Updates the 'framework' state when selection changes
  const handleFrameworkChange = (frameworkId) => {
    setFramework(frameworkId);
  };

  // Handles navigation back to the main page
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div>
      {/* Component for selecting the comparison framework */}
      <FrameworkChoose setFramework={handleFrameworkChange} />

      {/* Component for displaying the comparison data */}
      <ComparisonTable
        company1={company1}
        year1={year1}
        company2={company2}
        year2={year2}
        companyid1={companyid1}
        companyid2={companyid2}
        framework={framework}
      />

      {/* Button to return to the main page */}
      <button onClick={handleBack}>Back To Mainpage</button>
    </div>
  );
};

export default ComparePage;
