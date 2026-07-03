const Review = require('../models/Review');
const Hotel = require('../models/Hotel');

// @desc    Create review
exports.createReview = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const { hotel } = req.body;

    const hotelData = await Hotel.findById(hotel);
    if (!hotelData) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: req.user.id, hotel });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this hotel' });
    }

    const review = await Review.create(req.body);

    // Update hotel rating
    await updateHotelRating(hotel);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a hotel
exports.getHotelReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId })
      .populate('user', 'name profileImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await updateHotelRating(review.hotel);

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const hotelId = review.hotel;
    await review.deleteOne();

    await updateHotelRating(hotelId);

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// Helper: Update hotel rating
const updateHotelRating = async (hotelId) => {
  const reviews = await Review.find({ hotel: hotelId });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0;
  await Hotel.findByIdAndUpdate(hotelId, {
    rating: Math.round(avgRating * 10) / 10,
    numReviews: reviews.length,
  });
};