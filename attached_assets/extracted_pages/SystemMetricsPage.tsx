import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SystemMetricsPage = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [uptime, setUptime] = useState(99.9);

  useEffect(() => {
    setMetrics([
      { time: '1AM', load: 0.3 },
      { time: '3AM', load: 0.4 },
      { time: '5AM', load: 0.35 },
      { time: '7AM', load: 0.5 },
      { time: '9AM', load: 0.7 },
      { time: '11AM', load: 0.6 },
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🖥️ System Metrics</h1>
        <button className="bg-gray-200 px-3 py-2 rounded-md flex items-center gap-2">
          <RefreshCcw size={16}/> Refresh
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow"><p>API Uptime</p><h2 className="text-2xl font-bold">{uptime}%</h2></div>
        <div className="bg-white p-4 rounded-lg shadow"><p>Error Rate</p><h2 className="text-2xl font-bold">0.4%</h2></div>
        <div className="bg-white p-4 rounded-lg shadow"><p>Avg Response</p><h2 className="text-2xl font-bold">220ms</h2></div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md h-[300px]">
        <h3 className="font-semibold mb-2">System Load Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="load" stroke="#8b5e3c" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SystemMetricsPage;
