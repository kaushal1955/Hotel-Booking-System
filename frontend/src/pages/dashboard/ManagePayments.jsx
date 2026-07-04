import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../services/api';
import { FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try {
      const { data } = await paymentAPI.getAllPayments();
      setPayments(data.data);
    } catch (err) { toast.error('Failed to load payments'); }
    setLoading(false);
  };

  const filtered = payments.filter((p) =>
    p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Payments</h1>

      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by transaction ID or user..." className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-4">Transaction ID</th>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Hotel</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">{payment.transactionId}</td>
                    <td className="p-4">{payment.user?.name || 'N/A'}</td>
                    <td className="p-4">{payment.booking?.hotel?.hotelName || 'N/A'}</td>
                    <td className="p-4 font-medium">₹{payment.amount?.toLocaleString()}</td>
                    <td className="p-4 capitalize">{payment.paymentMethod?.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-gray-100'}`}>{payment.status}</span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No payments found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;