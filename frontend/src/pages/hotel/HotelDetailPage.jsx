import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHotelById,
  clearCurrentHotel,
  createReview,
} from "../../store/slices/hotelSlice";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  FiMapPin,
  FiStar,
  FiWifi,
  FiCoffee,
  FiTv,
  FiSun,
  FiWind,
  FiCheck,
  FiArrowLeft,
  FiHeart,
  FiShare2,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const HotelDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentHotel, rooms, reviews, loading } = useSelector(
    (state) => state.hotels,
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.wishlist && id) {
      setIsWishlisted(user.wishlist.some((w) => (w._id || w) === id));
    } else {
      setIsWishlisted(false);
    }
  }, [user, id]);

  const handleShare = async () => {
    const shareData = {
      title: hotel.hotelName,
      text: `Check out ${hotel.hotelName} on StayEase`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled the share sheet — no need to show an error
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      } catch (err) {
        toast.error("Could not copy link");
      }
    }
  };
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save hotels to your wishlist");
      navigate("/login");
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await authAPI.removeFromWishlist(id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await authAPI.addToWishlist(id);
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
    setWishlistLoading(false);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment before submitting");
      return;
    }
    setSubmittingReview(true);
    try {
      await dispatch(
        createReview({
          hotel: id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      ).unwrap();
      toast.success("Review submitted successfully");
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      toast.error(err || "Failed to submit review");
    }
    setSubmittingReview(false);
  };

  useEffect(() => {
    dispatch(fetchHotelById(id));
    return () => dispatch(clearCurrentHotel());
  }, [dispatch, id]);

  if (loading || !currentHotel) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const hotel = currentHotel;

  const amenityIcons = {
    "Wi-Fi": FiWifi,
    Pool: FiSun,
    Restaurant: FiCoffee,
    TV: FiTv,
    "Air Conditioning": FiWind,
    Breakfast: FiCoffee,
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          to="/hotels"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <FiArrowLeft /> <span>Back to Hotels</span>
        </Link>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 h-80 lg:h-96 rounded-2xl overflow-hidden">
            <img
              src={
                hotel.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
              }
              alt={hotel.hotelName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 h-80 lg:h-96">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden">
                <img
                  src={
                    hotel.images?.[idx]?.url ||
                    `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400`
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hotel Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">
                      {hotel.hotelName}
                    </h1>
                    <span className="text-xs capitalize bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                      {hotel.category}
                    </span>
                  </div>
                  <p className="text-gray-500 flex items-center">
                    <FiMapPin className="mr-1" /> {hotel.address?.city},{" "}
                    {hotel.address?.state}, {hotel.address?.country}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FiHeart
                      className={
                        isWishlisted
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border hover:bg-gray-50"
                  >
                    <FiShare2 className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar
                      key={s}
                      className={
                        s <= hotel.starRating
                          ? "text-secondary-500 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({hotel.numReviews || 0} reviews)
                </span>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {hotel.rating || "New"}
                </span>
              </div>

              <p className="text-gray-600 mt-6 leading-relaxed">
                {hotel.description}
              </p>

              {/* Amenities */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {hotel.amenities?.map((amenity, idx) => {
                    const Icon = amenityIcons[amenity] || FiCheck;
                    return (
                      <span
                        key={idx}
                        className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl text-sm"
                      >
                        <Icon className="text-primary-600" size={16} />{" "}
                        <span>{amenity}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Policies */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Hotel Policies</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-500">Check-in:</span>{" "}
                    <span className="font-medium">
                      {hotel.policies?.checkIn || "2:00 PM"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-500">Check-out:</span>{" "}
                    <span className="font-medium">
                      {hotel.policies?.checkOut || "12:00 PM"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-500">Cancellation:</span>{" "}
                    <span className="font-medium">
                      {hotel.policies?.cancellation || "Free 24h before"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-500">Children:</span>{" "}
                    <span className="font-medium">
                      {hotel.policies?.children || "Welcome"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Rooms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => setSelectedRoom(room)}
                    className="border rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            room.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=200"
                          }
                          alt={room.roomType}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800 capitalize">
                            {room.roomType} Room
                          </h4>
                          <p className="text-sm text-gray-500">
                            Room #{room.roomNumber} · Up to {room.maxGuests}{" "}
                            guests
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {room.amenities?.map((a, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-primary-600">
                          ₹{room.pricePerNight}
                        </p>
                        <p className="text-xs text-gray-400">per night</p>
                        <Link
                          to={`/book/${hotel._id}?room=${room._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-2 inline-block px-6 py-2 rounded-lg text-sm font-medium ${room.isAvailable ? "btn-primary" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                        >
                          {room.isAvailable ? "Book Now" : "Unavailable"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No rooms added yet.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border-b pb-6 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {review.user?.name?.[0] || "?"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {review.user?.name || "Anonymous"}
                            </h4>
                            <div className="flex text-secondary-500">
                              {[...Array(review.rating)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className="fill-current"
                                  size={14}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mt-2">
                            {review.comment}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAuthenticated && user?.role === "customer" && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5"
                        aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                      >
                        <FiStar
                          size={22}
                          className={
                            s <= (hoverRating || reviewRating)
                              ? "text-secondary-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows="3"
                    placeholder="Share your experience..."
                    className="input-field mb-4"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>
                  <button
                    className="btn-primary disabled:opacity-50"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold mb-4">Book Your Stay</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Check In
                  </label>
                  <input type="date" className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Check Out
                  </label>
                  <input type="date" className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Guests
                  </label>
                  <select className="input-field text-sm">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Guest{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <Link
                  to={isAuthenticated ? `/book/${hotel._id}` : "/login"}
                  className="btn-primary w-full text-center block"
                >
                  {isAuthenticated ? "Book Now" : "Login to Book"}
                </Link>
              </form>
              <div className="mt-4 pt-4 border-t text-sm text-gray-500 space-y-2">
                <div className="flex justify-between">
                  <span>Free cancellation</span>
                  <FiCheck className="text-green-500" />
                </div>
                <div className="flex justify-between">
                  <span>No prepayment needed</span>
                  <FiCheck className="text-green-500" />
                </div>
                <div className="flex justify-between">
                  <span>Secure booking</span>
                  <FiCheck className="text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Details Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRoom(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-64">
                <img
                  src={
                    selectedRoom.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
                  }
                  alt={selectedRoom.roomType}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-800 capitalize">
                    {selectedRoom.roomType} Room
                  </h3>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-primary-600">
                      ₹{selectedRoom.pricePerNight}
                    </p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>Room #{selectedRoom.roomNumber}</span>
                  <span className="flex items-center">
                    <FiUsers className="mr-1" /> Up to {selectedRoom.maxGuests}{" "}
                    guests
                  </span>
                  <span
                    className={
                      selectedRoom.isAvailable
                        ? "text-green-600 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    {selectedRoom.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                {selectedRoom.description && (
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {selectedRoom.description}
                  </p>
                )}

                {selectedRoom.amenities?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Room Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg text-sm"
                        >
                          <FiCheck className="text-primary-600" size={14} />{" "}
                          <span>{a}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to={`/book/${hotel._id}?room=${selectedRoom._id}`}
                  onClick={() => setSelectedRoom(null)}
                  className={`block text-center px-6 py-3 rounded-lg text-sm font-medium ${selectedRoom.isAvailable ? "btn-primary" : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"}`}
                >
                  {selectedRoom.isAvailable ? "Book Now" : "Unavailable"}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelDetailPage;
