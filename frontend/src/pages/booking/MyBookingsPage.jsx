import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserBookings,
  cancelBooking,
} from "../../store/slices/bookingSlice";
import { bookingAPI } from "../../services/api";
import {
  FiCalendar,
  FiMapPin,
  FiXCircle,
  FiDownload,
  FiEye,
} from "react-icons/fi";
import toast from "react-hot-toast";

const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await dispatch(cancelBooking(id)).unwrap();
        toast.success("Booking cancelled successfully");
      } catch (err) {
        toast.error(err || "Cancellation failed");
      }
    }
  };

  const handleDownloadInvoice = async (booking) => {
    setDownloadingId(booking._id);
    try {
      const response = await bookingAPI.downloadInvoice(booking._id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${booking.invoiceNumber || booking._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download invoice");
    }
    setDownloadingId(null);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    refunded: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start exploring and book your first hotel.
            </p>
            <Link to="/hotels" className="btn-primary">
              Browse Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        booking.hotel?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200"
                      }
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.hotel?.hotelName || "Hotel"}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <FiMapPin size={14} className="mr-1" />
                        {booking.hotel?.address?.city || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <FiCalendar size={14} className="inline mr-1" />
                        {new Date(
                          booking.checkInDate,
                        ).toLocaleDateString()} -{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.bookingStatus] || "bg-gray-100 text-gray-700"}`}
                        >
                          {booking.bookingStatus}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {booking.paymentStatus}
                        </span>
                        <span className="text-sm font-semibold text-primary-600">
                          ₹{booking.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/booking-confirmation/${booking._id}`}
                      className="p-2 rounded-lg border hover:bg-gray-50 text-gray-600"
                    >
                      <FiEye size={18} />
                    </Link>
                    <button
                      onClick={() => handleDownloadInvoice(booking)}
                      disabled={
                        booking.paymentStatus !== "paid" ||
                        downloadingId === booking._id
                      }
                      title={
                        booking.paymentStatus !== "paid"
                          ? "Invoice available after payment"
                          : "Download invoice"
                      }
                      className="p-2 rounded-lg border hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiDownload size={18} />
                    </button>
                    {["pending", "confirmed"].includes(
                      booking.bookingStatus,
                    ) && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 text-sm"
                      >
                        <FiXCircle size={16} /> <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
