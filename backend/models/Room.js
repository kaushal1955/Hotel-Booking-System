const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please enter room number'],
    },
    roomType: {
      type: String,
      required: [true, 'Please select room type'],
      enum: ['single', 'double', 'twin', 'suite', 'deluxe', 'penthouse', 'family'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify room capacity'],
      min: 1,
      max: 20,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please enter price per night'],
      min: 0,
    },
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    amenities: [
      {
        type: String,
        enum: [
          'AC',
          'Non-AC',
          'Wi-Fi',
          'TV',
          'Breakfast',
          'Bathroom',
          'Balcony',
          'Mini Bar',
          'Safe',
          'Work Desk',
          'Air Purifier',
          'Smoke Detector',
        ],
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maxGuests: {
      type: Number,
      required: [true, 'Please specify max guests'],
      min: 1,
    },
    bedType: {
      type: String,
      enum: ['single', 'double', 'queen', 'king', 'twin', 'bunk'],
      default: 'double',
    },
    size: {
      type: Number, // in sq ft
      default: 0,
    },
    description: {
      type: String,
      default: '',
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// A hotel cannot have two rooms with same number
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);