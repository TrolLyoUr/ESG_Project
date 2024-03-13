.metric-input {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column; /* 保持垂直排列 */
    align-items: flex-start; /* 改为从左侧对齐 */
    color: #82CED5; /* 保持原有颜色 */
    max-width: 300px; /* 保持最大宽度，避免过窄 */
    margin: 20px; /* 调整为有一定边距 */
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 保持轻微的阴影效果 */
    border-radius: 8px;
    overflow: hidden; /* 隐藏溢出内容 */
  }
  
  .metric-input button {
    background-color: #6881D6; /* 保持原有的背景颜色 */
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .metric-input button:hover {
    background-color: #4458A7; /* 悬停时颜色变深 */
  }
  
  .metric-input .content-container { /* 展示内容的容器 */
    display: flex;
    flex-direction: column;
    max-height: 500px;
    overflow-y: auto; /* 启用滚动 */
    width: 100%; /* 使用可用宽度 */
    margin-top: 15px; /* 顶部间距 */
  }
  
  .metric-input .content-container div { /* 内容项样式 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 项目垂直排列 */
    align-items: flex-start; /* 从左侧对齐 */
    background-color: #E6E6FA; /* 轻淡的紫色背景 */
    color: #333; /* 深色字体，提高可读性 */
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* 添加轻微阴影以增加层次感 */
  }
  
  .metric-input span {
    display: inline-block;
    white-space: nowrap;
    margin: 5px;
    padding: 5px;
    border-radius: 3px;
    background-color: #B0C4DE; /* 淡蓝色背景 */
    color: #333; /* 深色字体，提高可读性 */
  }
  
