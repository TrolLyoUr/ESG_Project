import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <label className="label" htmlFor="company">Company</label>
          <select className="select" id="company">
            <option value="" disabled selected hidden>xxx</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </li>
        <li>
          <label className="label" htmlFor="year">Year</label>
          <select className="select" id="year">
            <option value="" disabled selected hidden>xxx</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </li>
        <li>
          <label className="label" htmlFor="framework">Framework</label>
          <select className="select" id="framework">
            <option value="" disabled selected hidden>xxx</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </li>
      </ul>
      <button className="confirm-button">Confirm</button> {/* 添加确认按钮 */}
    </div>
  );
};

export default Sidebar;
