import React from 'react';
import './ESGPage.css';
import ESGForm from './esg/ESGForm'; // Assuming ESGForm.js is in the same directory
import ESGRatingDisplay from './esg/ESGRatingDisplay'; 
// Assuming ESGRatingDisplay.js is in the same directory
import MetricInput from './esg/MetricInput';
import MetricWeight from './esg/MetricWeight';

const App = () => {
  return (
    <div className="app">
      {/* Header component could go here if there's a header */}
      <ESGForm />
      <MetricInput />
      <MetricWeight />
      <ESGRatingDisplay />
    </div>
  );
};

export default App;
