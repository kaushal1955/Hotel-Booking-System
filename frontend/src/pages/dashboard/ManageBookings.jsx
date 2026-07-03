import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { bookingAPI } from '../../services/api';
import { FiEye, FiXCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageBookings = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const endpoint = user?.role === 'admin' ? bookingAPI.getAdminBookings : bookingAPI.getOwnerBookings;
      const { data } = await endpoint();
      setBookings(data.data);
    } catch (err) { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'cancel') {
        await bookingAPI.cancelBooking(id);
        toast.success('Booking cancelled');
      } else {
        await bookingAPI.updateBooking(id, { bookingStatus: action });
        toast.success(`Booking ${action}`);
      }
      loadBookings();
    } catch (err) { toast.error('Action failed'); }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    refunded: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Hotel</th>
                  <th className="text-left p-4">Room</th>
                  <th className="text-left p-4">Dates</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Payment</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{booking.user?.name || 'N/A'}</td>
                    <td className="p-4">{booking.hotel?.hotelName || 'N/A'}</td>
                    <td className="p-4">{booking.room?.roomNumber || 'N/A'} ({booking.room?.roomType})</td>
                    <td className="p-4 text-xs">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium">₹{booking.totalAmount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.bookingStatus] || 'bg-gray-100'}`}>{booking.bookingStatus}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.paymentStatus}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-1">
                        {booking.bookingStatus === 'pending' && (
                          <>
                            <button onClick={() => handleAction(booking._id, 'confirmed')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Confirm"><FiCheck size={16} /></button>
                            <button onClick={() => handleAction(booking._id, 'cancel')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Cancel"><FiXCircle size={16} /></button>
                          </>
                        )}
                        {booking.bookingStatus === 'confirmed' && (
                          <button onClick={() => handleAction(booking._id, 'completed')} className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 hover:bg-blue-100">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No bookings found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;