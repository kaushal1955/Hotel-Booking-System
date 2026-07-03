const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// @desc    Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalHotels = await Hotel.countDocuments();
    const totalApprovedHotels = await Hotel.countDocuments({ isApproved: true });
    const totalRooms = await Room.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const totalReviews = await Review.countDocuments();

    const payments = await Payment.find({ status: 'success' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Monthly revenue (current year)
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = [];
    for (let i = 0; i < 12; i++) {
      const monthPayments = await Payment.find({
        status: 'success',
        paidAt: {
          $gte: new Date(currentYear, i, 1),
          $lt: new Date(currentYear, i + 1, 1),
        },
      });
      monthlyRevenue.push(monthPayments.reduce((sum, p) => sum + p.amount, 0));
    }

    // Occupancy rate (percentage of rooms booked in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.find({
      createdAt: { $gte: thirtyDaysAgo },
      bookingStatus: { $in: ['confirmed', 'completed'] },
    });
    const occupancyRate = totalRooms > 0 ? ((recentBookings.length / totalRooms) * 100).toFixed(1) : 0;

    // Recent bookings
    const recentBookingData = await Booking.find()
      .populate('user', 'name email')
      .populate('hotel', 'hotelName')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalHotels,
          totalApprovedHotels,
          totalRooms,
          totalCustomers,
          totalOwners,
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          totalReviews,
          totalRevenue,
          occupancyRate,
        },
        monthlyRevenue,
        recentBookings: recentBookingData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const queryObj = {};
    if (req.query.role) queryObj.role = req.query.role;
    if (req.query.isActive !== undefined) queryObj.isActive = req.query.isActive === 'true';

    const users = await User.find(queryObj).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove user from hotels they own
    await Hotel.updateMany({ owner: user._id }, { isActive: false });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/unblock user
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue report
exports.getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'success' };
    if (startDate || endDate) {
      filter.paidAt = {};
      if (startDate) filter.paidAt.$gte = new Date(startDate);
      if (endDate) filter.paidAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter).populate({
      path: 'booking',
      populate: { path: 'hotel', select: 'hotelName' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Group by hotel
    const revenueByHotel = {};
    payments.forEach((p) => {
      const hotelName = p.booking?.hotel?.hotelName || 'Unknown';
      revenueByHotel[hotelName] = (revenueByHotel[hotelName] || 0) + p.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalPayments: payments.length,
        payments,
        revenueByHotel,
      },
    });
  } catch (error) {
    next(error);
  }
};