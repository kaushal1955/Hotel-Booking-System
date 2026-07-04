const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create a payment intent
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, paymentGateway } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user.id,
      paymentMethod,
      transactionId,
      amount: booking.totalAmount,
      paymentGateway: paymentGateway || 'none',
      status: 'pending',
    });

    // If Razorpay
    if (paymentGateway === 'razorpay') {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(booking.totalAmount * 100), // in paise
        currency: 'INR',
        receipt: payment.transactionId,
      };

      const order = await razorpay.orders.create(options);

      return res.status(201).json({
        success: true,
        data: payment,
        gateway: 'razorpay',
        order,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    }

    // If Stripe
    if (paymentGateway === 'stripe') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100),
        currency: 'usd',
        metadata: { bookingId: booking._id.toString(), paymentId: payment._id.toString() },
      });

      return res.status(201).json({
        success: true,
        data: payment,
        gateway: 'stripe',
        clientSecret: paymentIntent.client_secret,
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, transactionId, gatewayResponse } = req.body;

    const payment = await Payment.findOne({ booking: bookingId, transactionId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'success';
    payment.gatewayResponse = gatewayResponse || {};
    payment.paidAt = Date.now();
    await payment.save();

    // Update booking
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundId = `REF${Date.now()}`;
    await payment.save();

    await Booking.findByIdAndUpdate(req.params.bookingId, {
      paymentStatus: 'refunded',
      bookingStatus: 'refunded',
    });

    res.status(200).json({ success: true, message: 'Refund processed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by booking
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        select: 'bookingStatus totalAmount',
        populate: { path: 'hotel', select: 'hotelName' },
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};