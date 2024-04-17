import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ComparisonTable.css';
import { SERVER_URL } from "./config"; 

const frameworkMapping = {
    4: "GRI",
    5: "SASB",
    6: "TCFD"
};


const ComparisonTable = ({ company1, year1, company2, year2,companyid1,companyid2,framework }) => {
    
    const [mergedMetrics, setMergedMetrics] = useState({});
    const [openMetrics, setOpenMetrics] = useState({});
    const [esgScore1, setEsgScore1] = useState(null);
    const [esgScore2, setEsgScore2] = useState(null);
    const [chartData, setChartData] = useState({});
    const [isTimeout, setIsTimeout] = useState(false);


    useEffect(() => {
        if (companyid1 && year1 && framework) {
            console.log("Fetching data for company1:", companyid1, year1, framework);
            const fetchData = async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/app/calculateperformance?company=${companyid1}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
    
                    const data = await response.json();
                console.log("Data from backend:", data);
                const frameworkName = frameworkMapping[framework];
                console.log("Framework name:", frameworkName);
                
                // 假设 data 直接包含了框架数据，如 data.GRI 或 data.SASB
                const yearData = data[frameworkName];
                console.log("Year data for framework:", yearData);
                const score1 = yearData && yearData[year1] !== undefined ? yearData[year1].toFixed(3) : null;
                    
                    setEsgScore1(score1);
                    console.log("Score1:", score1);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setEsgScore1(null);
                }
            };
    
            fetchData();
        } else {
            console.log("Missing parameters: companyId, year, or frameworkId");
            setEsgScore1(null);
        }
    }, [framework]); // Depend only on framework
    
    // Hook for companyid2 and year2
    useEffect(() => {
        if (companyid2 && year2 && framework) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/app/calculateperformance?company=${companyid2}&scale=1`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
    
                    const data = await response.json();
                    const frameworkName = frameworkMapping[framework];
                    console.log("Framework name:", frameworkName);
                    
                    // 假设 data 直接包含了框架数据，如 data.GRI 或 data.SASB
                    const yearData = data[frameworkName];
                    console.log("Year data for framework:", yearData);
                    const score2 = yearData && yearData[year2] !== undefined ? yearData[year2].toFixed(3) : null;
                    setEsgScore2(score2);
    
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setEsgScore2(null);
                }
            };
    
            fetchData();
        } else {
            console.log("Missing parameters: companyId, year, or frameworkId");
            setEsgScore2(null);
        }
    }, [framework]); 

    useEffect(() => {
        const fetchData = async () => {
          try {
            const url1 = `${SERVER_URL}/app/indicatordata?company=${companyid1}&year=${year1}&framework=${framework}`;
            const url2 = `${SERVER_URL}/app/indicatordata?company=${companyid2}&year=${year2}&framework=${framework}`;
            const response1 = await fetch(url1, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            const response2 = await fetch(url2, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
      
            if (!response1.ok) {
              throw new Error(`Network response was not ok: ${response1.status}`);
            }
            
            if (!response2.ok) {
                throw new Error(`Network response was not ok: ${response2.status}`);
              }

            const data1 = await response1.json();
            const data2 = await response2.json();
           
            const result = mergeIndicatorData(data1, data2);
            setMergedMetrics(result);
          
          } catch (error) {
            console.error('Error fetching data:', error);
           
          }
        };
        
        fetchData();
      
      }, [framework]); 
      
    
    function mergeIndicatorData(data1, data2) {
        const mergedData = {};
      
        // 遍历data1的每个metric
        Object.keys(data1).forEach((metricId) => {
          const metric = data1[metricId];
          mergedData[metricId] = {
            metric_id: metric.metric_id,
            metric_name: metric.metric_name,
            pillar: metric.pillar,
            indicators: {}
          };
      
          // 合并data1中的指标
          metric.indicators.forEach(indicator => {
            mergedData[metricId].indicators[indicator.indicator_id] = {
              indicator_id: indicator.indicator_id,
              indicator_name: indicator.indicator_name,
              value1: indicator.value, // 保存来自data1的值为value1
              unit: indicator.unit,
              year: indicator.year,
              source: indicator.source
            };
          });
      
          // 合并data2中的指标，如果已存在则添加value2
          if (data2[metricId]) {
            data2[metricId].indicators.forEach(indicator => {
              if (mergedData[metricId].indicators[indicator.indicator_id]) {
                mergedData[metricId].indicators[indicator.indicator_id].value2 = indicator.value;
              } else {
                mergedData[metricId].indicators[indicator.indicator_id] = {
                  indicator_id: indicator.indicator_id,
                  indicator_name: indicator.indicator_name,
                  value2: indicator.value, // 只有value2如果data1中不存在
                  unit: indicator.unit,
                  year: indicator.year,
                  source: indicator.source
                };
              }
            });
          }
        });
      
        // 转换指标数据结构为数组
        Object.keys(mergedData).forEach(metricId => {
          const indicatorsArray = [];
          Object.keys(mergedData[metricId].indicators).forEach(indicatorId => {
            indicatorsArray.push(mergedData[metricId].indicators[indicatorId]);
          });
          mergedData[metricId].indicators = indicatorsArray;
        });
      
        return mergedData;
    }

    

    const toggleMetric = async (metricId) => {
        setOpenMetrics(prev => ({ ...prev, [metricId]: !prev[metricId] }));
        if (!chartData[metricId]) {
            try {
                // 并行发送两个API请求
                const url1 = `${SERVER_URL}/app/metricsdatavalue/?companies=${companyid1}&framework=${framework}&metrics=${metricId}`;
                const url2 = `${SERVER_URL}/app/metricsdatavalue/?companies=${companyid2}&framework=${framework}&metrics=${metricId}`;
                const responses = await Promise.all([
                    fetch(url1, { method: 'GET', headers: { 'Content-Type': 'application/json' }}),
                    fetch(url2, { method: 'GET', headers: { 'Content-Type': 'application/json' }})
                ]);
                // 检查响应是否成功
                responses.forEach(response => {
                    if (!response.ok) throw new Error(`Failed to fetch data for metric ${metricId}`);
                });
    
                // 解析JSON数据
                const data = await Promise.all(responses.map(res => res.json()));
                console.log("Complete data from backend:", data);
                // 构建Chart.js所需的数据结构
                const chartData = {
                    labels: data[0].data[0].metrics_scores.map(score => score.year),
                    datasets: [
                        {
                            label: data[0].data[0].company_name,
                            data: data[0].data[0].metrics_scores.map(score => score.score),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)'
                        },
                        {
                            label: data[1].data[0].company_name,
                            data: data[1].data[0].metrics_scores.map(score => score.score),
                            fill: false,
                            borderColor: 'rgb(255, 99, 132)'
                        }
                    ]
                };
    
                // 更新状态以保存数据
                setChartData(prev => ({ ...prev, [metricId]: chartData }));
    
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        }
    };

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>Company names</th>
                        <th colSpan="2">{company1} ({year1})</th>
                        <th colSpan="2">{company2} ({year2})</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="esg-score">ESG Score</td>
                        <td colSpan="2" className="esg-score-cell">{esgScore1 !== null ? esgScore1 : 'Unavailable'}</td>
                        <td colSpan="2" className="esg-score-cell">{esgScore2 !== null ? esgScore2 : 'Unavailable'}</td>
                    </tr>
                    {Object.keys(mergedMetrics).map(metricId => {
                        const metric = mergedMetrics[metricId];
                        const pillarClass = `pillar-${metric.pillar.toLowerCase()}`;
                        return (
                            <React.Fragment key={metricId}>
                                <tr onClick={() => toggleMetric(metricId)} className="metric-row">
                                    <td>
                                        {metric.metric_name}{' '}
                                        <span className={`${pillarClass} pillar-indicator`}>
                                        {metric.pillar.toUpperCase()}
                                        </span></td>
                                    <td colSpan="4">Click to view details</td>
                                </tr>
                                {openMetrics[metricId] && (
                                    <>
                                        <tr>
                                            <td colSpan="5">
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Indicator Name</th>
                                                            <th>{company1}({year1})</th>
                                                            <th>{company2}({year2})</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {metric.indicators.map(indicator => (
                                                            <tr key={indicator.indicator_id} className="indicator-row">
                                                                <td>{indicator.indicator_name}</td>
                                                                <td>{indicator.value1  || 'N/A'} {indicator.unit}</td>
                                                                <td>{indicator.value2  || 'N/A'} {indicator.unit}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                        <td colSpan="5">
                                            {chartData[metricId] ? (
                                                <div className="chart-container1">
                                                    <Line data={chartData[metricId]} />
                                                </div>
                                            ) : (
                                                <p className="loading-text">Loading chart...</p>
                                            )}
                                        </td>
                                        </tr>
                                    </>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
    
    
    
};

export default ComparisonTable;