import React, { useState } from 'react';
import './ESGPage.css';
import ESGForm from './ESGForm/ESGForm';
import ESGRatingDisplay from './ESGRatingDisplay/ESGRatingDisplay';
import MetricWeight from './MetricWeight/MetricWeight';
import MetricInput from './MetricWeight/MetricInput';
import Footer from './Footer';

const ESGPage = () => {
  return (
    <div className="container">
      {/* Header component could go here if there's a header */}
      <ESGForm />
      <MetricInput />
      <MetricWeight />
      <ESGRatingDisplay />
      <Footer />
    </div>
  );
};

export default ESGPage;