import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiCreditCard,
  FiSmartphone,
  FiShield,
  FiArrowLeft,
  FiLock,
} from "react-icons/fi";
import { bookingAPI, paymentAPI } from "../../services/api";
import toast from "react-hot-toast";

const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const paymentMethods = [
  { value: "razorpay", label: "Razorpay", icon: FiShield },
  { value: "stripe", label: "Stripe", icon: FiCreditCard },
  { value: "credit_card", label: "Credit Card", icon: FiCreditCard },
  { value: "upi", label: "UPI", icon: FiSmartphone },
];

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState(
    location.state?.paymentMethod || "razorpay",
  );

  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const { data } = await bookingAPI.getBooking(bookingId);
        setBooking(data.data);
      } catch (err) {
        toast.error("Could not load booking");
        navigate("/bookings");
      }
      setLoading(false);
    };
    loadBooking();
  }, [bookingId, navigate]);

  useEffect(() => {
    if (booking && booking.paymentStatus === "paid") {
      navigate(`/booking-confirmation/${bookingId}`, { replace: true });
    }
  }, [booking, bookingId, navigate]);

  const verifyAndFinish = async (transactionId, gatewayResponse = {}) => {
    try {
      await paymentAPI.verifyPayment({
        bookingId,
        transactionId,
        gatewayResponse,
      });
      toast.success("Payment successful");
      navigate(`/booking-confirmation/${bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment verification failed");
      setProcessing(false);
    }
  };

  // Real Razorpay checkout
  const handleRazorpayPay = async () => {
    setProcessing(true);
    const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!ok) {
      toast.error("Could not load Razorpay. Check your connection.");
      setProcessing(false);
      return;
    }
    try {
      const res = await paymentAPI.createPayment({
        bookingId,
        paymentMethod: "razorpay",
        paymentGateway: "razorpay",
      });
      const { order, key_id, data: paymentRecord } = res.data;

      const rzp = new window.Razorpay({
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "StayEase",
        description: booking?.hotel?.hotelName || "Hotel booking",
        order_id: order.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          await verifyAndFinish(paymentRecord.transactionId, response);
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed");
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start payment");
      setProcessing(false);
    }
  };

  // Stripe, credit card, UPI: create a pending payment record, then verify once
  // the person completes the method-specific step below.
  const handleSimulatedPay = async () => {
    setProcessing(true);
    try {
      const res = await paymentAPI.createPayment({
        bookingId,
        paymentMethod: method,
        paymentGateway: "none",
      });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await verifyAndFinish(res.data.data.transactionId, {
        method,
        simulated: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
      setProcessing(false);
    }
  };

  const handlePayClick = () => {
    if (method === "razorpay") return handleRazorpayPay();
    if (method === "upi" && !upiId.trim()) return toast.error("Enter a UPI ID");
    if (
      (method === "credit_card" || method === "stripe") &&
      (!card.number.trim() || !card.expiry.trim() || !card.cvv.trim())
    ) {
      return toast.error("Fill in your card details");
    }
    return handleSimulatedPay();
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-gray-600 mb-6">
          <FiArrowLeft />
          <span>Payment</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-6">Choose payment method</h1>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {paymentMethods.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={processing}
                    onClick={() => setMethod(value)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      method === value
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {method === "razorpay" && (
                <div className="rounded-xl border border-gray-200 p-6 text-center">
                  <FiShield
                    className="mx-auto mb-3 text-primary-600"
                    size={28}
                  />
                  <p className="text-sm text-gray-600 mb-1">
                    You'll be taken to Razorpay's secure checkout.
                  </p>
                  <p className="text-xs text-gray-400">
                    Cards, UPI, wallets and net banking all supported there.
                  </p>
                </div>
              )}

              {method === "upi" && (
                <div className="rounded-xl border border-gray-200 p-6 space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@bank"
                      disabled={processing}
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              {(method === "credit_card" || method === "stripe") && (
                <div className="rounded-xl border border-gray-200 p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card number
                    </label>
                    <input
                      type="text"
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value })
                      }
                      placeholder="4242 4242 4242 4242"
                      disabled={processing}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on card
                    </label>
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) =>
                        setCard({ ...card, name: e.target.value })
                      }
                      placeholder="Name on card"
                      disabled={processing}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={card.expiry}
                        onChange={(e) =>
                          setCard({ ...card, expiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        disabled={processing}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={card.cvv}
                        onChange={(e) =>
                          setCard({ ...card, cvv: e.target.value })
                        }
                        placeholder="123"
                        disabled={processing}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handlePayClick}
                disabled={processing}
                className="btn-primary w-full py-4 text-lg mt-8 flex items-center justify-center space-x-2"
              >
                <FiLock size={16} />
                <span>
                  {processing
                    ? "Processing..."
                    : `Pay ₹${booking.totalAmount.toLocaleString()}`}
                </span>
              </button>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-4">Order summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Hotel</span>
                  <span className="font-medium">
                    {booking.hotel?.hotelName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Room</span>
                  <span>{booking.room?.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights</span>
                  <span>{booking.nightsCount}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{booking.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ₹{booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
