const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write a review'],
      maxLength: [1000, 'Review cannot exceed 1000 characters'],
    },
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same user on same hotel
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
