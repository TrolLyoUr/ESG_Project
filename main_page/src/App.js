// App.js

import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Header from './Header'; // 引入Header组件

const App = () => {
  return (
    <div className="App">
      <Header /> {/* 添加Header组件 */}
      <Sidebar />
      <div className="main-content">
        <h1></h1>
        <p></p>
        <div className="feature-areas">
            <div className="feature-area feature-area-1">Feature 1</div>
            <div className="feature-area feature-area-2">Feature 2</div>
            <div className="feature-area feature-area-3">Feature 3</div>
            <div className="feature-area feature-area-4">Feature 4</div>
            
        </div>
      </div>
    </div>
  );
};

export default App;
