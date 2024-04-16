import React, { useState,useEffect } from 'react';
import Sidebar from './homepage/Sidebar';
import TotalScore from './homepage/TotalScore';
import FrameworkChoose from './homepage/FrameworkChoose';
import MetricsCard from './homepage/MetricsCard';
import ChartsContainer from './homepage/ChartsContainer';

const HomePage = ({ isSidebarOpen, toggleSidebar }) => {
  const [profile, setProfile] = useState({
    company: "",
    year: "",
    framework: "",
  });


  const handleProfileChange = (key, value) => {
    setProfile(prevProfile => ({ ...prevProfile, [key]: value }));
  };

  const contentStyle = {
    marginLeft: isSidebarOpen ? '20%' : '0',
    width: isSidebarOpen ? '80%' : '100%',
    transition: 'margin-left 0.3s, width 0.3s',
  };

  const featureBarsStyle = {
    marginLeft: isSidebarOpen ? '20%' : '0',
    transition: 'margin-left 0.3s',
  };

  return (
    <div className="content-area" style={contentStyle}>
      <button onClick={toggleSidebar} className="toggle-button">
        {isSidebarOpen ? '<' : '>'}
      </button>
      <div className="feature-bars" style={featureBarsStyle}>
      <TotalScore
          className="feature-bar-item"
          companyId={profile.company}
          year={profile.year}
          frameworkId={profile.framework} // 将 framework 改为 frameworkId
        />
        <FrameworkChoose
          className="feature-bar-item"
          setFramework={(framework) => handleProfileChange('framework', framework)}
        />
        <MetricsCard
          className="feature-bar-item"
          
          currentFramework={profile.framework}
        />
        <ChartsContainer
          className="feature-bar-item"
          companyId={profile.company}
          year={profile.year}
          frameworkId={profile.framework} 
        />
      </div>
      <Sidebar
        isOpen={isSidebarOpen}
        setCompanyId={(company) => handleProfileChange('company', company)}
        setYear={(year) => handleProfileChange('year', year)}
      />
    </div>
  );
};

export default HomePage;
