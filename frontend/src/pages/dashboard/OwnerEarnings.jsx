import React, { useEffect, useState } from 'react';
import { bookingAPI, hotelAPI } from '../../services/api';
import { FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OwnerEarnings = () => {
  const [earnings, setEarnings] = useState({ total: 0, bookings: [], monthlyData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEarnings(); }, []);

  const loadEarnings = async () => {
    try {
      const { data } = await bookingAPI.getOwnerBookings();
      const bookings = data.data || [];
      const total = bookings
        .filter((b) => b.paymentStatus === 'paid' || b.bookingStatus === 'confirmed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      // Group by month
      const monthlyMap = {};
      bookings.forEach((b) => {
        if (b.paymentStatus === 'paid' || b.bookingStatus === 'confirmed') {
          const date = new Date(b.createdAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyMap[key] = (monthlyMap[key] || 0) + (b.totalAmount || 0);
        }
      });
      
      setEarnings({ total, bookings, monthlyData: Object.entries(monthlyMap).sort() });
    } catch (err) { toast.error('Failed to load earnings'); }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">₹{earnings.total.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{earnings.bookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {earnings.bookings.filter((b) => b.bookingStatus === 'confirmed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <FiCalendar className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {earnings.monthlyData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold mb-4">Monthly Earnings</h3>
          <div className="space-y-3">
            {earnings.monthlyData.map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-600 rounded-full h-2 transition-all"
                      style={{ width: `${(amount / Math.max(...earnings.monthlyData.map(([, a]) => a))) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">₹{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Booking History</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Hotel</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {earnings.bookings.map((booking) => (
              <tr key={booking._id} className="border-t hover:bg-gray-50">
                <td className="p-4">{booking.user?.name || 'N/A'}</td>
                <td className="p-4">{booking.hotel?.hotelName || 'N/A'}</td>
                <td className="p-4 font-medium">₹{booking.totalAmount?.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{booking.bookingStatus}</span>
                </td>
                <td className="p-4 text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {earnings.bookings.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerEarnings;