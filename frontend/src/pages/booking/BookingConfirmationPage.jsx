import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiDownload, FiHome, FiPrinter } from "react-icons/fi";
import { bookingAPI } from "../../services/api";
import toast from "react-hot-toast";

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const { data } = await bookingAPI.getBooking(id);
        if (data.data.paymentStatus !== "paid") {
          navigate(`/payment/${id}`, { replace: true });
          return;
        }
        setCurrentBooking(data.data);
      } catch (err) {
        toast.error("Could not load booking");
        navigate("/bookings");
      }
      setLoading(false);
    };
    loadBooking();
  }, [id, navigate]);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const response = await bookingAPI.downloadInvoice(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentBooking?.invoiceNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download invoice");
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!currentBooking) return null;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 mb-8">
            Your booking has been confirmed. Check your email for details.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-medium">{id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice</span>
              <span className="font-medium">
                {currentBooking?.invoiceNumber ||
                  "INV-" + id.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-medium">Confirmed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-primary-600">
                ₹{currentBooking?.totalAmount?.toLocaleString() || "Pending"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/bookings"
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <FiHome /> <span>View My Bookings</span>
            </Link>
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <FiDownload />{" "}
              <span>{downloading ? "Preparing..." : "Download Invoice"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
