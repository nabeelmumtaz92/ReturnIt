import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BusinessIntelligencePage = () => {
  const forecastData = [
    { week: 'Week 1', revenue: 1500 },
    { week: 'Week 2', revenue: 1800 },
    { week: 'Week 3', revenue: 2200 },
    { week: 'Week 4', revenue: 2600 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧠 Business Intelligence</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Forecasted Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8b5e3c" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">AI Insights (Mock)</h3>
        <p className="text-gray-600">
          Retailers A and B contribute 45% of total returns. Average processing time reduced by 12%.
          Predicted growth next quarter: <span className="font-bold text-green-600">+14%</span>.
        </p>
      </div>
    </div>
  );
};

export default BusinessIntelligencePage;
