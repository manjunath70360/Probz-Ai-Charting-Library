import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import html2canvas from 'html2canvas';

import "./index.css"

const Chart = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const chartRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = () => {
    axios.get('/data.json').then((response) => {
      const processedData = processData(response.data, timeframe);
      setData(processedData);
    });
  };

  const processData = (data, timeframe) => {
    switch (timeframe) {
      case 'daily':
        return data; // No processing needed for daily data
      case 'weekly':
        return aggregateDataByWeek(data);
      case 'monthly':
        return aggregateDataByMonth(data);
      default:
        return data;
    }
  };

  const aggregateDataByWeek = (data) => {
    const aggregatedData = [];
    let currentWeekData = [];
    data.forEach((entry, index) => {
      currentWeekData.push(entry);
      if ((index + 1) % 7 === 0 || index === data.length - 1) {
        const averageValue = currentWeekData.reduce((sum, entry) => sum + entry.value, 0) / currentWeekData.length;
        const startDate = currentWeekData[0].timestamp;
        aggregatedData.push({ timestamp: startDate, value: averageValue });
        currentWeekData = [];
      }
    });
    return aggregatedData;
  };

  const aggregateDataByMonth = (data) => {
    const aggregatedData = [];
    let currentMonthData = [];
    data.forEach((entry, index) => {
      currentMonthData.push(entry);
      if (index === data.length - 1 || new Date(data[index + 1].timestamp).getMonth() !== new Date(entry.timestamp).getMonth()) {
        const averageValue = currentMonthData.reduce((sum, entry) => sum + entry.value, 0) / currentMonthData.length;
        const startDate = currentMonthData[0].timestamp;
        aggregatedData.push({ timestamp: startDate, value: averageValue });
        currentMonthData = [];
      }
    });
    return aggregatedData;
  };

  const handleClick = (data, index) => {
    alert(`Timestamp: ${data.timestamp}\nValue: ${data.value}`);
  };

  const handleExport = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'chart.png';
      link.click();
    });
  };

  return (
    <div>
      <div>
        <button className='btn' onClick={() => setTimeframe('daily')}>Daily</button>
        <button className='btn' onClick={() => setTimeframe('weekly')}>Weekly</button>
        <button className='btn' onClick={() => setTimeframe('monthly')}>Monthly</button>
        <button className='btn' onClick={handleExport}>Export as PNG</button>
      </div>
      <div ref={chartRef}>
        <LineChart width={800} height={400} data={data} onClick={(e) => handleClick(e.activePayload[0].payload, e.activeTooltipIndex)}>
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="value" stroke="#ff7300" />
        </LineChart>
      </div>
    </div>
  );
};

export default Chart;
