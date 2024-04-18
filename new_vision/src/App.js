import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import ComparePage from "./ComparePage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({
    company: "",
    year: "",
    framework: "",
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFrameworkChange = (framework) => {
    setProfile((prevProfile) => ({ ...prevProfile, framework }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const saveProfile = () => {
    setShowProfileModal(false);
  };

  return (
    <Router basename="/static">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              isSidebarOpen={isSidebarOpen}
              profile={profile}
              showProfileModal={showProfileModal}
              setShowProfileModal={setShowProfileModal}
              handleProfileChange={handleProfileChange}
              handleFrameworkChange={handleFrameworkChange}
              saveProfile={saveProfile}
              toggleSidebar={toggleSidebar}
            />
          }
        />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </Router>
  );
};

export default App;
