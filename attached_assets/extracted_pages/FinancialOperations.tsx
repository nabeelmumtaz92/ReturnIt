import React, { useEffect, useState } from 'react';
import { Download, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FinancialOperations = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    setData([
      { date: 'Mon', incoming: 450, outgoing: 320 },
      { date: 'Tue', incoming: 620, outgoing: 410 },
      { date: 'Wed', incoming: 700, outgoing: 480 },
      { date: 'Thu', incoming: 540, outgoing: 390 },
      { date: 'Fri', incoming: 860, outgoing: 600 }
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">💰 Financial Operations</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <h2 className="text-2xl font-bold">$2,450.00</h2>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-gray-500 text-sm">Pending Balance</p>
          <h2 className="text-2xl font-bold">$650.00</h2>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Payouts</p>
          <h2 className="text-2xl font-bold">$12,890.00</h2>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md h-[300px]">
        <h3 className="font-semibold mb-2">Revenue vs Payouts</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="incoming" stroke="#4f46e5" />
            <Line type="monotone" dataKey="outgoing" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialOperations;
