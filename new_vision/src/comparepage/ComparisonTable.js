import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ComparisonTable.css';
import { SERVER_URL } from "./config"; 

const frameworkMapping = {
    4: 'GRI',
    5: 'SASB',
    6: 'TCFD'
};


const ComparisonTable = ({ company1, year1, company2, year2,companyid1,companyid2,framework }) => {
    const [data, setData] = useState({
        finalScore: { company1: 0, company2: 0 },
        metrics: []
    });
    const [openMetrics, setOpenMetrics] = useState({});
    const [esgScore1, setEsgScore1] = useState(null);
    const [esgScore2, setEsgScore2] = useState(null);



    useEffect(() => {
        if (companyid1 && year1 && framework) {
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
                    const frameworkName = frameworkMapping[framework];
                    const yearData = data.result[frameworkName];
                    const score1 = yearData && yearData[year1] !== undefined ? yearData[year1] : null;
                    setEsgScore1(score1);
    
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
                    const response = await fetch(`${SERVER_URL}/app/calculateperformance?company=${companyid2}`, {
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
                    const yearData = data.result[frameworkName];// 输出对应框架的年份数据
                    const score2 = yearData && yearData[year2] !== undefined ? yearData[year2] : null;
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
            const url2 = `${SERVER_URL}/app/indicatordata?company=${companyid1}&year=${year1}&framework=${framework}`;
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
            console.log("Complete data1 from backend:", data1);
            console.log("Complete data2 from backend:", data2);
            const result = mergeIndicatorData(data1, data2);
            console.log(result);
          
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

    
    
    useEffect(() => {
        const dataExample = {
            metrics: [
                {
                    id: 1,
                    name: "Environmental",
                    data: {
                        labels: ["2019", "2020", "2021"],
                        datasets: [
                            {
                                label: company1,
                                data: [70, 75, 80],
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                            },
                            {
                                label: company2,
                                data: [65, 68, 76],
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                            }
                        ]
                    },
                    indicators: {
                        ghgEmissions: ["3,500 tCO2e", "4,000 tCO2e"],
                        energyUse: ["150,000 GJ", "145,000 GJ"],
                        wastewaterTreated: ["1,200 KL", "1,500 KL"]
                    }
                }
                
                // Add more metrics as necessary
            ]
        };
        setData(dataExample);
    }, [company1, company2, year1, year2]);

    const toggleMetric = (metricId) => {
        setOpenMetrics(prev => ({ ...prev, [metricId]: !prev[metricId] }));
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
                    <td colSpan="2" className="esg-score-cell">{esgScore1 !== null ? esgScore1 : 'Loading'}</td>
                    <td colSpan="2" className="esg-score-cell">{esgScore2 !== null ? esgScore2 : 'Loading'}</td>
                </tr>
                    {data.metrics.map((metric) => (
                        <React.Fragment key={metric.id}>
                            <tr onClick={() => toggleMetric(metric.id)}>
                                <td>{metric.name}</td>
                                <td colSpan="4">Click to view details</td>
                            </tr>
                            {openMetrics[metric.id] && (
                                <>
                                    <tr>
                                        <td colSpan="5">
                                            <Line
                                                data={metric.data}
                                                width={400}
                                                height={200}
                                                options={{ maintainAspectRatio: false }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Indicators</th>
                                                        <th>{company1} ({year1})</th>
                                                        <th>{company2} ({year2})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {metric.indicators && Object.keys(metric.indicators).map(key => (
                                                        <tr key={key}>
                                                            <td>{key}</td>
                                                            <td>{metric.indicators[key][0]}</td>
                                                            <td>{metric.indicators[key][1]}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    
};

export default ComparisonTable;