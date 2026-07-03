import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.get("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/update-profile", data),
  uploadProfileImage: (formData) =>
    api.post("/auth/profile-image", formData, {
      headers: { "Content-Type": undefined },
    }),
  updatePassword: (data) => api.put("/auth/update-password", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  getWishlist: () => api.get("/auth/wishlist"),
  addToWishlist: (hotelId) => api.post(`/auth/wishlist/${hotelId}`),
  removeFromWishlist: (hotelId) => api.delete(`/auth/wishlist/${hotelId}`),
};

// Hotel APIs
export const hotelAPI = {
  getHotels: (params) => api.get("/hotels", { params }),
  getHotel: (id) => api.get(`/hotels/${id}`),
  createHotel: (data) => api.post("/hotels", data),
  updateHotel: (id, data) => api.put(`/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
  getOwnerHotels: () => api.get("/hotels/owner"),
  getAllHotelsAdmin: () => api.get("/hotels/admin/all"),
  approveHotel: (id) => api.put(`/hotels/${id}/approve`),
  uploadHotelImages: (id, formData) =>
    api.post(`/hotels/${id}/images`, formData, {
      headers: { "Content-Type": undefined },
    }),
  deleteHotelImage: (id, imageId) =>
    api.delete(`/hotels/${id}/images/${imageId}`),
};

// Room APIs
export const roomAPI = {
  getRooms: (params) => api.get("/rooms", { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post("/rooms", data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  checkAvailability: (params) =>
    api.get("/rooms/check-availability", { params }),
  uploadRoomImages: (id, formData) =>
    api.post(`/rooms/${id}/images`, formData, {
      headers: { "Content-Type": undefined },
    }),
  deleteRoomImage: (id, imageId) =>
    api.delete(`/rooms/${id}/images/${imageId}`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data) => api.post("/bookings", data),
  getUserBookings: () => api.get("/bookings/user"),
  getBooking: (id) => api.get(`/bookings/${id}`),
  getAdminBookings: () => api.get("/bookings/admin"),
  getOwnerBookings: () => api.get("/bookings/owner"),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  downloadInvoice: (id) =>
    api.get(`/bookings/${id}/invoice`, { responseType: "blob" }),
};

// Payment APIs
export const paymentAPI = {
  createPayment: (data) => api.post("/payments/create", data),
  verifyPayment: (data) => api.post("/payments/verify", data),
  refundPayment: (bookingId) => api.post(`/payments/refund/${bookingId}`),
  getPaymentByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getAllPayments: () => api.get("/payments"),
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post("/reviews", data),
  getHotelReviews: (hotelId) => api.get(`/reviews/${hotelId}`),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Testimonial APIs
export const testimonialAPI = {
  getTestimonials: (params) => api.get("/testimonials", { params }),
  createTestimonial: (data) => api.post("/testimonials", data),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),
};
// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getRevenueReport: (params) => api.get("/admin/revenue", { params }),
};

export default api;
