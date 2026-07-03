const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  refundPayment,
  getPaymentByBooking,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', protect, createPayment);
router.post('/verify', protect, verifyPayment);
router.post('/refund/:bookingId', protect, authorize('admin'), refundPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;