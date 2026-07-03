const Testimonial = require("../models/Testimonial");

// @desc    Create a testimonial (public - any visitor can share their experience)
// @route   POST /api/testimonials
// @access  Public
exports.createTestimonial = async (req, res, next) => {
  try {
    const { name, message, rating } = req.body;

    if (!name || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Name and message are required" });
    }

    const testimonial = await Testimonial.create({
      name: name.trim(),
      message: message.trim(),
      rating: rating || 5,
      user: req.user ? req.user.id : undefined,
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const testimonials = await Testimonial.find()
      .sort("-createdAt")
      .limit(limit);

    res
      .status(200)
      .json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a testimonial (admin only, for moderation)
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    await testimonial.deleteOne();

    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    next(error);
  }
};
