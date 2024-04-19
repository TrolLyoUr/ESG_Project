import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import ComparePage from "./ComparePage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  // States to manage the app's UI and profile data
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Controls sidebar visibility
  const [showProfileModal, setShowProfileModal] = useState(false); // Controls profile modal visibility
  const [profile, setProfile] = useState({
    company: "",
    year: "",
    framework: "",
  }); // Stores user profile data

  // Function to toggle the sidebar open/closed
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handles changes to the framework selection
  const handleFrameworkChange = (framework) => {
    setProfile((prevProfile) => ({ ...prevProfile, framework }));
  };

  // Handles updates to profile input fields
  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  // Function to save profile data (assumes there's logic to handle saving elsewhere)
  const saveProfile = () => {
    setShowProfileModal(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            // Passing props to HomePage component
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
