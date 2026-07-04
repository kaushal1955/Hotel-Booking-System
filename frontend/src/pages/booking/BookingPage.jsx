import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotelById, clearCurrentHotel } from '../../store/slices/hotelSlice';
import { createBooking } from '../../store/slices/bookingSlice';
import { FiCalendar, FiUsers, FiCreditCard, FiShield, FiCheck, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentHotel, rooms, loading } = useSelector((state) => state.hotels);
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    room: searchParams.get('room') || '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    specialRequests: '',
    couponCode: '',
    paymentMethod: 'razorpay',
  });

  const [nights, setNights] = useState(0);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchHotelById(hotelId));
    return () => dispatch(clearCurrentHotel());
  }, [dispatch, hotelId]);

  const selectedRoom = rooms.find((r) => r._id === form.room);

  useEffect(() => {
    if (form.checkInDate && form.checkOutDate && selectedRoom) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      if (checkOut > checkIn) {
        const n = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        setNights(n);
        let amount = selectedRoom.pricePerNight * n;
        let disc = 0;
        if (form.couponCode.toUpperCase() === 'WELCOME10') disc = amount * 0.1;
        if (form.couponCode.toUpperCase() === 'STAY20') disc = amount * 0.2;
        if (form.couponCode.toUpperCase() === 'FLAT500') disc = 500;
        setDiscount(disc);
        setTotal(amount - disc);
      }
    }
  }, [form.checkInDate, form.checkOutDate, form.couponCode, selectedRoom]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.room) return toast.error('Please select a room');
    if (!form.checkInDate || !form.checkOutDate) return toast.error('Please select dates');
    if (nights <= 0) return toast.error('Invalid dates');

    setSubmitting(true);
    try {
      const result = await dispatch(createBooking({
        hotel: hotelId,
        room: form.room,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guests: form.guests,
        specialRequests: form.specialRequests,
        couponCode: form.couponCode,
      })).unwrap();

      if (result.success) {
        toast.success("Booking created! Proceed to payment.");
        navigate(`/payment/${result.data._id}`, {
          state: { paymentMethod: form.paymentMethod },
        });
      }
    } catch (err) {
      toast.error(err || 'Booking failed');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  }

  if (!currentHotel) return null;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/hotels/${hotelId}`} className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6">
          <FiArrowLeft /> <span>Back to Hotel</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hotel Info */}
                <div className="flex items-center space-x-4 pb-6 border-b">
                  <img src={currentHotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-semibold text-lg">{currentHotel.hotelName}</h3>
                    <p className="text-sm text-gray-500">{currentHotel.address?.city}, {currentHotel.address?.state}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-sm ${s <= currentHotel.starRating ? 'text-secondary-500' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                  <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} required className="input-field">
                    <option value="">Choose a room type</option>
                    {rooms.filter((r) => r.isAvailable).map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} - Room {room.roomNumber} (₹{room.pricePerNight}/night, up to {room.maxGuests} guests)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><FiCalendar className="inline mr-1" />Check In</label>
                    <input type="date" value={form.checkInDate} onChange={(e) => setForm({ ...form, checkInDate: e.target.value })} required min={new Date().toISOString().split('T')[0]} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><FiCalendar className="inline mr-1" />Check Out</label>
                    <input type="date" value={form.checkOutDate} onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })} required min={form.checkInDate || new Date().toISOString().split('T')[0]} className="input-field" />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><FiUsers className="inline mr-1" />Number of Guests</label>
                  <select value={form.guests} onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) })} className="input-field">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n} disabled={selectedRoom && n > selectedRoom.maxGuests}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  {selectedRoom && <p className="text-xs text-gray-400 mt-1">Max {selectedRoom.maxGuests} guests for this room</p>}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea rows="3" value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} placeholder="Any special requirements..." className="input-field" />
                </div>

                {/* Coupon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input type="text" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} placeholder="WELCOME10, STAY20, FLAT500" className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">Try: WELCOME10 (10% off), STAY20 (20% off), FLAT500 (₹500 off)</p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'razorpay', label: 'Razorpay' },
                      { value: 'stripe', label: 'Stripe' },
                      { value: 'credit_card', label: 'Credit Card' },
                      { value: 'upi', label: 'UPI' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setForm({ ...form, paymentMethod: method.value })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                          form.paymentMethod === method.value
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg">
                  {submitting ? 'Processing...' : `Confirm Booking · ₹${total.toLocaleString()}`}
                </button>
              </form>
            </div>
          </div>

          {/* Price Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-4">Price Summary</h3>
              {selectedRoom ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Room Type</span><span className="capitalize font-medium">{selectedRoom.roomType}</span></div>
                  <div className="flex justify-between text-sm"><span>Room Number</span><span>{selectedRoom.roomNumber}</span></div>
                  <div className="flex justify-between text-sm"><span>Price per Night</span><span>₹{selectedRoom.pricePerNight}</span></div>
                  <div className="flex justify-between text-sm"><span>Nights</span><span>{nights}</span></div>
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{(selectedRoom.pricePerNight * nights).toLocaleString()}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>
                  )}
                  <hr />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary-600">₹{total.toLocaleString()}</span></div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a room to see pricing</p>
              )}

              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600"><FiShield className="text-green-500" /><span>Secure payment</span></div>
                <div className="flex items-center space-x-2 text-sm text-gray-600"><FiCheck className="text-green-500" /><span>Free cancellation</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;