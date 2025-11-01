import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, RefreshCcw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Mock API
    setTransactions([
      { id: 'T001', type: 'Payment', amount: 45.5, status: 'Completed', date: '2025-11-01' },
      { id: 'T002', type: 'Refund', amount: -15.0, status: 'Processed', date: '2025-11-01' },
      { id: 'T003', type: 'Payout', amount: -32.2, status: 'Pending', date: '2025-10-31' }
    ]);
  }, []);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">💳 Transactions</h1>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-1">
            <Download size={16}/> Export
          </button>
          <button className="bg-gray-200 px-3 py-2 rounded-md flex items-center gap-1">
            <RefreshCcw size={16}/> Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{t.id}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3">${t.amount.toFixed(2)}</td>
                <td className="p-3">{t.status}</td>
                <td className="p-3">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
