const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please select check-in date'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please select check-out date'],
    },
    guests: {
      type: Number,
      required: [true, 'Please specify number of guests'],
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    specialRequests: {
      type: String,
      default: '',
      maxLength: [500, 'Special requests cannot exceed 500 characters'],
    },
    nightsCount: {
      type: Number,
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate invoice number before saving
bookingSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.invoiceNumber = `INV-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);