import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { FiMapPin, FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const DashboardHome = () => {
  const dispatch = useDispatch();
  const { stats, monthlyRevenue, recentBookings, loading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) dispatch(fetchDashboardStats());
  }, [dispatch, isAdmin]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenue (\u20B9)',
      data: monthlyRevenue || Array(12).fill(0),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Bookings',
      data: [65, 78, 90, 85, 110, 95],
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }],
  };

  const statCards = isAdmin ? [
    { icon: FiMapPin, label: 'Total Hotels', value: stats?.totalHotels || 0, color: 'bg-blue-500' },
    { icon: FiUsers, label: 'Customers', value: stats?.totalCustomers || 0, color: 'bg-green-500' },
    { icon: FiBookOpen, label: 'Bookings', value: stats?.totalBookings || 0, color: 'bg-purple-500' },
    { icon: FiDollarSign, label: 'Revenue', value: `\u20B9${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-orange-500' },
  ] : [
    { icon: FiMapPin, label: 'My Hotels', value: stats?.totalHotels || 0, color: 'bg-blue-500' },
    { icon: FiBookOpen, label: 'Bookings', value: stats?.totalBookings || 0, color: 'bg-purple-500' },
    { icon: FiDollarSign, label: 'Earnings', value: `\u20B9${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-orange-500' },
    { icon: FiTrendingUp, label: 'Occupancy', value: `${stats?.occupancyRate || 0}%`, color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: card.color.replace('bg-', '').replace('500', '600') }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="text-white" size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Revenue Trend</h3>
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Monthly Bookings</h3>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
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
                  {(recentBookings || []).map((booking) => (
                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{booking.user?.name || 'N/A'}</td>
                      <td className="p-4">{booking.hotel?.hotelName || 'N/A'}</td>
                      <td className="p-4 font-medium">\u20B9{booking.totalAmount?.toLocaleString()}</td>
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
                  {(!recentBookings || recentBookings.length === 0) && (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No recent bookings</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isAdmin && (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <h3 className="text-lg font-semibold mb-2">Owner Dashboard</h3>
          <p className="text-gray-500">Manage your hotels, rooms, and view earnings from the sidebar.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
