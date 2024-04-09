import React, { useState } from "react";
import "./App.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Feature1 from "./Feature1";
import Feature4 from "./Feature4";

const App = () => {
  const [selectedId, setSelectedId] = useState(null); // 添加状态

  return (
    <div className="App">
      <Header />
      <Sidebar />
      <div className="main-content">
        <div className="feature-areas">
          <Feature1 setSelectedId={setSelectedId} />{" "}
          {/* 传递setSelectedId给Feature1 */}
          <div className="feature-area feature-area-2">Feature 2</div>
          <div className="feature-area feature-area-3">Feature 3</div>
          <Feature4 selectedId={selectedId} />{" "}
          {/* 将selectedId传递给Feature4 */}
        </div>
      </div>
    </div>
  );
};

export default App;
