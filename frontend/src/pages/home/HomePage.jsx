import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../../store/slices/hotelSlice";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiArrowRight,
  FiShield,
  FiHeadphones,
  FiPercent,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { testimonialAPI } from "../../services/api";

const defaultTestimonials = [
  {
    name: "Priya Sharma",
    message:
      "Amazing experience! The booking process was seamless and the hotel exceeded our expectations.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    message:
      "Best platform for hotel bookings. Great prices and excellent customer support.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    message:
      "I loved the variety of hotels available. Found the perfect stay for my family vacation.",
    rating: 5,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, loading } = useSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(fetchHotels({ limit: 8, sort: "-rating" }));
  }, [dispatch]);

  const [searchParams, setSearchParams] = React.useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  // Guest testimonials (customer-submitted)
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    message: "",
    rating: 5,
  });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await testimonialAPI.getTestimonials({ limit: 6 });
        if (res.data?.data?.length) {
          setTestimonials(res.data.data);
        }
      } catch (error) {
        // Fall back silently to the default testimonials shown above
      }
    };
    loadTestimonials();
  }, []);

  const handleTestimonialChange = (e) => {
    const { name, value } = e.target;
    setTestimonialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (!testimonialForm.name.trim() || !testimonialForm.message.trim()) {
      toast.error("Please fill in your name and message");
      return;
    }

    setSubmittingTestimonial(true);
    try {
      const res = await testimonialAPI.createTestimonial(testimonialForm);
      setTestimonials((prev) => [res.data.data, ...prev]);
      setTestimonialForm({ name: "", message: "", rating: 5 });
      setShowTestimonialForm(false);
      toast.success("Thank you for sharing your experience!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not submit your message. Please try again.",
      );
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.city) params.set("city", searchParams.city);
    if (searchParams.checkIn) params.set("checkIn", searchParams.checkIn);
    if (searchParams.checkOut) params.set("checkOut", searchParams.checkOut);
    if (searchParams.guests > 1) params.set("guests", searchParams.guests);
    navigate(`/hotels?${params.toString()}`);
  };

  const featuredHotels = hotels.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full mb-6">
              #1 Trusted Hotel Booking Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500">
              Stay
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover and book thousands of hotels worldwide. Experience comfort,
            luxury, and the best prices guaranteed.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1 text-left">
                  Destination
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City or Hotel"
                    value={searchParams.city}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, city: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 text-left">
                  Check In
                </label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      checkIn: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 text-left">
                  Check Out
                </label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      checkOut: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1 text-left">
                  Guests
                </label>
                <div className="flex space-x-2">
                  <select
                    value={searchParams.guests}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        guests: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Guest{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <FiSearch size={18} />
                    <span className="hidden md:inline">Search</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="section-title">Why Choose StayEase?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              We provide the best hotel booking experience with unmatched
              benefits.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: FiShield,
                title: "Best Price Guarantee",
                desc: "We ensure you get the best rates for your stay. Find a lower price elsewhere and we'll match it.",
              },
              {
                icon: FiHeadphones,
                title: "24/7 Customer Support",
                desc: "Our dedicated support team is available round the clock to assist you with any queries.",
              },
              {
                icon: FiPercent,
                title: "Exclusive Deals & Offers",
                desc: "Get access to exclusive discounts, loyalty rewards, and seasonal promotions.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="text-primary-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="section-title">Featured Hotels</h2>
              <p className="section-subtitle">
                Top-rated hotels handpicked for you.
              </p>
            </div>
            <Link
              to="/hotels"
              className="btn-outline hidden md:flex items-center space-x-2"
            >
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredHotels.map((hotel) => (
                <motion.div key={hotel._id} variants={fadeInUp}>
                  <Link
                    to={`/hotels/${hotel._id}`}
                    className="card block overflow-hidden group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          hotel.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"
                        }
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-semibold text-gray-800">
                        ★ {hotel.rating || "New"}
                      </div>
                      {hotel.featured && (
                        <div className="absolute top-3 left-3 bg-secondary-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                        {hotel.hotelName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <FiMapPin size={14} className="mr-1" />
                        {hotel.address?.city}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              size={14}
                              className={
                                star <= hotel.starRating
                                  ? "text-secondary-500 fill-current"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {hotel.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/hotels" className="btn-primary">
              View All Hotels
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="section-title">Popular Destinations</h2>
            <p className="section-subtitle">
              Explore top destinations across India.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              {
                name: "Mumbai",
                image:
                  "https://images.unsplash.com/photo-1726390731971-463ce97cc5b0?w=300",
                count: "450+ Hotels",
              },
              {
                name: "Delhi",
                image:
                  "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300",
                count: "380+ Hotels",
              },
              {
                name: "Jaipur",
                image:
                  "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=300",
                count: "280+ Hotels",
              },
              {
                name: "Goa",
                image:
                  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300",
                count: "320+ Hotels",
              },
              {
                name: "Bangalore",
                image:
                  "https://images.unsplash.com/photo-1687158266872-fd2773fa76c6?w=300",
                count: "400+ Hotels",
              },
              {
                name: "Kerala",
                image:
                  "https://images.unsplash.com/photo-1704365159871-6bf63f00b9c8?w=300",
                count: "250+ Hotels",
              },
            ].map((dest, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Link
                  to={`/hotels?city=${dest.name}`}
                  className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] block"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">
                      {dest.name}
                    </h3>
                    <p className="text-white/80 text-sm">{dest.count}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              What Our Guests Say
            </h2>
            <p className="text-gray-400 mt-2">
              Trusted by thousands of happy travelers.
            </p>
            <button
              onClick={() => setShowTestimonialForm((prev) => !prev)}
              className="mt-6 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              {showTestimonialForm ? "Cancel" : "Share Your Experience"}
            </button>
          </motion.div>

          <AnimatePresence>
            {showTestimonialForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleTestimonialSubmit}
                className="max-w-xl mx-auto mb-12 bg-gray-800 p-6 rounded-2xl overflow-hidden"
              >
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={testimonialForm.name}
                    onChange={handleTestimonialChange}
                    maxLength={60}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-1">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() =>
                          setTestimonialForm((prev) => ({ ...prev, rating: s }))
                        }
                      >
                        <FiStar
                          size={22}
                          className={
                            s <= testimonialForm.rating
                              ? "fill-current text-secondary-400"
                              : "text-gray-600"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm text-gray-300 mb-1">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={testimonialForm.message}
                    onChange={handleTestimonialChange}
                    maxLength={500}
                    rows={4}
                    placeholder="Tell other travelers about your experience..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {testimonialForm.message.length}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingTestimonial}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {submittingTestimonial ? "Submitting..." : "Submit Review"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div
            key={testimonials.length}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((review, idx) => (
              <motion.div
                key={review._id || idx}
                variants={fadeInUp}
                className="bg-gray-800 p-6 rounded-2xl"
              >
                <div className="flex text-secondary-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar
                      key={s}
                      className={
                        s <= (review.rating || 5)
                          ? "fill-current"
                          : "text-gray-600"
                      }
                      size={16}
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  "{review.message || review.text}"
                </p>
                <p className="font-medium">{review.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy travelers. Sign up today and get exclusive
              deals.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/hotels"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Browse Hotels
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
