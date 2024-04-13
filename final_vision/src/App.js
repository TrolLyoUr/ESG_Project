import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './Topbar';
import FrameworkChoose from './FrameworkChoose'; 
import MetricsCard from './MetricsCard'; 
import TotalScore from './TotalScore'; 
import ChartsContainer from './ChartsContainer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [profile, setProfile] = useState({
    company: 'Default Company',
    year: 'Default Year',
    framework: 'React', // 确保这里的属性名称与其他地方一致
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFrameworkChange = (framework) => {
    setProfile(prevProfile => ({ ...prevProfile, framework }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile(prevProfile => ({ ...prevProfile, [name]: value }));
  };

  const saveProfile = () => {
    setShowProfileModal(false);
    // 实际保存逻辑应在此实现
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
    <div className="App">
      <button onClick={toggleSidebar} className="toggle-button">
        {isSidebarOpen ? '<' : '>'}
      </button>
      <div className="content-area" style={contentStyle}>
        <TopBar
          profile={profile}
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          handleProfileChange={handleProfileChange}
          saveProfile={saveProfile}
        />
        <div className="feature-bars" style={featureBarsStyle}>
          <TotalScore
            className="feature-bar-item"
            companyName={profile.company}
            year={profile.year}
            framework={profile.framework}
          />
          <FrameworkChoose className="feature-bar-item" setFramework={handleFrameworkChange} />
          <MetricsCard className="feature-bar-item" currentFramework={profile.framework} />
          <ChartsContainer className="feature-bar-item" />
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} />
    </div>
  );
};

export default App;
