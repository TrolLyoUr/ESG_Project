
import React, { useState, useEffect } from 'react'; 
import { Card, Button, Collapse, ListGroup, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './MetricsCard.css';

const MetricsCard = ({ currentFramework }) => {
  const [metrics, setMetrics] = useState([]);
  // 定义 metrics 状态变量
  useEffect(() => {
    // 示例数据，您可能需要根据实际情况调整
    const frameworkMetrics = {
      4: [
        {
          id: 1,
          title: 'React Indicator 1',
          isSelected: true, // 添加 isSelected 属性
          subMetrics: [
            { id: 1, title: 'React Metrics 1', score: 20, isSelected: true },
            { id: 2, title: 'React Metrics 2', score: 30, isSelected: true },
          ],
          weight: 1,
          isOpen: false,
        },
        // 更多 React 指标...
      ],
      5: [
        {
          id: 1,
          title: 'Vue Indicator 1',
          isSelected: true, // 添加 isSelected 属性
          subMetrics: [
            { id: 1, title: 'Vue Metrics 1', score: 20, isSelected: true },
            { id: 2, title: 'Vue Metrics 2', score: 30, isSelected: true },
          ],
          weight: 1,
          isOpen: false,
        },
        // 更多 React 指标...
      ],
      6: [
        {
          id: 1,
          title: 'Angular Indicator 1',
          isSelected: true, // 添加 isSelected 属性
          subMetrics: [
            { id: 1, title: 'Angular Metrics 1', score: 20, isSelected: true },
            { id: 2, title: 'Angular Metrics 2', score: 30, isSelected: true },
          ],
          weight: 1,
          isOpen: false,
        },
        // 更多 React 指标...
      ],
      // 添加更多框架及其指标...
    };

  setMetrics(frameworkMetrics[currentFramework] || []);
  }, [currentFramework]);



  const [tooltipContent, setTooltipContent] = useState({}); // 存储每个提示的内容
  const [loading, setLoading] = useState(false); // 表示请求数据的加载状态

  const fetchTooltipContent = async (id) => {
    setLoading(true);
    try {
      // 示例 URL，请根据实际情况替换
      const response = await fetch(`https://your-backend.com/data?id=${id}`);
      const data = await response.json();
      // 假设后端返回的数据有一个 `content` 字段
      setTooltipContent(prev => ({ ...prev, [id]: data.content }));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };// 用于存储提示内容

  // 定义 toggleSubMetrics 函数，用于切换小数据的显示/隐藏
  const toggleSubMetrics = (id) => {
    setMetrics(metrics.map(metric =>
      metric.id === id ? { ...metric, isOpen: !metric.isOpen } : metric
    ));
  };

  // 定义 updateWeight 函数，用于更新权重
  const updateWeight = (id, newWeight, isSubMetric = false) => {
    setMetrics(metrics.map(metric => {
      if (metric.id === id) {
        // 更新 indicator 的权重
        return { ...metric, weight: newWeight };
      } else if (isSubMetric) {
        // 更新 metrics 的权重
        const subMetrics = metric.subMetrics.map(sub => sub.id === id ? { ...sub, weight: newWeight } : sub);
        return { ...metric, subMetrics };
      }
      return metric;
    }));
  };
  const getScoreClassName = (score) => {
    if (score < 60) return 'score-red';
    if (score <= 80) return 'score-yellow';
    return 'score-green';
  };


  const toggleSelection = (id, isSubMetric = false, subMetricId = null) => {
    setMetrics(metrics.map(metric => {
      if (metric.id === id) {
        if (!isSubMetric) {
          // Toggle the selection of the main metric
          return { ...metric, isSelected: !metric.isSelected };
        } else {
          // Toggle the selection of a sub-metric
          const updatedSubMetrics = metric.subMetrics.map(subMetric => {
            if (subMetric.id === subMetricId) {
              return { ...subMetric, isSelected: !subMetric.isSelected };
            }
            return subMetric;
          });
          return { ...metric, subMetrics: updatedSubMetrics };
        }
      }
      return metric;
    }));
    // Optional: Send the selection status to the backend
  };

  
  return (
    <Card className="metrics-card">
      <Card.Body>
        <Card.Title>Indicators</Card.Title>
        <ListGroup>
          {metrics.map(metric => (
            <ListGroup.Item key={metric.id} className="metric-item">

              <div className="d-flex justify-content-between align-items-center">
              <Form.Check
                  type="checkbox"
                  checked={metric.isSelected}
                  onChange={() => toggleSelection(metric.id)}
                  label={metric.title}
                />
                <span>{metric.title}</span>
                <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  {loading ? 'Loading...' : tooltipContent[metric.id] || 'Default tooltip content'}
                </Tooltip>
              }
            >
              <span className="info-icon" onClick={() => fetchTooltipContent(metric.id)}>!</span>
            </OverlayTrigger>
                <div>
                  
                  <Form.Control
                    type="number"
                    value={metric.weight}
                    onChange={(e) => updateWeight(metric.id, e.target.value)}
                    style={{ width: '60px', display: 'inline', marginLeft: '20px' }}
                  />
                  <Button
                    onClick={() => toggleSubMetrics(metric.id)}
                    size="sm"
                    style={{ marginLeft: '10px' }}
                  >
                    {metric.isOpen ? 'Hide Metrics' : 'Show Metrics'}
                  </Button>
                </div>
              </div>
              <Collapse in={metric.isOpen}>
                <div>
                  <ListGroup variant="flush">
                  {metric.subMetrics.map((subMetric) => (
                    <ListGroup.Item key={subMetric.id} className="sub-metric-item">
                    <Form.Check
                      type="checkbox"
                      checked={subMetric.isSelected}
                      onChange={() => toggleSelection(metric.id, true, subMetric.id)}
                      label={`${subMetric.title} ${subMetric.score}`}
                    />
    <div className="d-flex justify-content-between align-items-center">
    
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Metric {subMetric.title} Information</Tooltip>}
      >
        <span>
          <span className="info-icon">!</span>
          <span className={`score-box ${getScoreClassName(subMetric.score)}`}>
            {subMetric.title} {subMetric.score}
          </span>
        </span>
      </OverlayTrigger>
      <Form.Control
          type="number"
          value={subMetric.weight}
          onChange={(e) => updateWeight(subMetric.id, e.target.value, true)}
          style={{ width: '60px', display: 'inline', marginLeft: '20px' }} // 将宽度调整为80px
        />
    </div>
  </ListGroup.Item>
))}
                  </ListGroup>
                </div>
              </Collapse>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};


export default MetricsCard;