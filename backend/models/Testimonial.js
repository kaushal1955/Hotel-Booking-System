const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxLength: [60, "Name cannot exceed 60 characters"],
    },
    message: {
      type: String,
      required: [true, "Please write a message"],
      trim: true,
      maxLength: [500, "Message cannot exceed 500 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
      default: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
