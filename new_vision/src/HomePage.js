import React, { useState, useEffect } from "react";
import Sidebar from "./homepage/Sidebar";
import TotalScore from "./homepage/TotalScore";
import FrameworkChoose from "./homepage/FrameworkChoose";
import MetricsCard from "./homepage/MetricsCard";
import ChartsContainer from "./homepage/ChartsContainer";

const HomePage = ({ isSidebarOpen, toggleSidebar }) => {
  // State to store user profile and selected metrics
  const [profile, setProfile] = useState({
    company: "",
    year: "",
    framework: "",
    companyName: "",
    selectedMetrics: [],
    weight: 0,
  });

  // Updates a specific property in the profile state
  const handleProfileChange = (key, value) => {
    setProfile((prevProfile) => ({ ...prevProfile, [key]: value }));
  };

  // Styles for content area, adjusted based on sidebar state
  const contentStyle = {
    marginLeft: isSidebarOpen ? "270px" : "0", // Shifts content with sidebar
    width: isSidebarOpen ? "100%" : "100%",
    transition: "margin-left 0.3s, width 0.3s", // Smooth transition effect
  };

  // Styles for feature bars, also adjusted based on sidebar state
  const featureBarsStyle = {
    marginLeft: isSidebarOpen ? "270px" : "0",
    marginTop: "20px",
    transition: "margin-left 0.3s",
  };

  return (
    <div className="content-area" style={contentStyle}>
      <div className="feature-bars" style={featureBarsStyle}>
        {/* Displays total score based on user selections */}
        <TotalScore
          className="feature-bar-item"
          companyId={profile.company}
          year={profile.year}
          frameworkId={profile.framework}
          weight={profile.weight}
        />

        {/* Component to let the user choose a framework */}
        <FrameworkChoose
          className="feature-bar-item"
          setFramework={(framework) =>
            handleProfileChange("framework", framework)
          }
        />

        {/* Displays relevant metrics based on user selections */}
        <MetricsCard
          className="feature-bar-item"
          currentFramework={profile.framework}
          selectedYear={profile.year}
          selectedCompany={profile.company}
          setSelectedMetrics={(metrics) =>
            handleProfileChange("selectedMetrics", metrics)
          }
          setWeight={(weight) => handleProfileChange("weight", weight)}
        />

        {/* Component to display charts based on selections */}
        <ChartsContainer
          className="feature-bar-item"
          companyId={profile.company}
          year={profile.year}
          frameworkId={profile.framework}
          companyname={profile.companyName}
        />
      </div>

      {/* Sidebar for company/year selection, controlled by isSidebarOpen prop */}
      <Sidebar
        isOpen={isSidebarOpen}
        setCompanyId={(company) => handleProfileChange("company", company)}
        setYear={(year) => handleProfileChange("year", year)}
        setCompanyname={(companyName) =>
          handleProfileChange("companyName", companyName)
        }
      />
    </div>
  );
};

export default HomePage;
