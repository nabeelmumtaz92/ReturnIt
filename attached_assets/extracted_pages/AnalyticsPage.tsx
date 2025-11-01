import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    setData([
      { month: 'Jan', revenue: 1000 },
      { month: 'Feb', revenue: 1800 },
      { month: 'Mar', revenue: 1200 },
      { month: 'Apr', revenue: 2400 },
      { month: 'May', revenue: 2000 }
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📈 Analytics</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow"><p>Total Revenue</p><h2 className="text-2xl font-bold">$8,400</h2></div>
        <div className="bg-white p-4 rounded-lg shadow"><p>Orders This Week</p><h2 className="text-2xl font-bold">148</h2></div>
        <div className="bg-white p-4 rounded-lg shadow"><p>Avg Tip %</p><h2 className="text-2xl font-bold">9.2%</h2></div>
        <div className="bg-white p-4 rounded-lg shadow"><p>Customer Retention</p><h2 className="text-2xl font-bold">82%</h2></div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md h-[300px]">
        <h3 className="font-semibold mb-2">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#8b5e3c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
