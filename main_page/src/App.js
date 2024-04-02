import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Header from './Header';
import Feature1 from './Feature1'; // 引入 Feature1 组件
import Feature4 from './Feature4';

const App = () => {
  return (
    <div className="App">
      <Header />
      <Sidebar />
      <div className="main-content">
        <h1>Welcome to Our Application</h1>
       
        <div className="feature-areas">
            <Feature1 /> 
            <div className="feature-area feature-area-2">Feature 2</div>
            <div className="feature-area feature-area-3">Feature 3</div>
            <Feature4 /> 
        </div>
      </div>
    </div>
  );
};

export default App;
