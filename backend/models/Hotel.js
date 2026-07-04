const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: [true, 'Please enter hotel name'],
      trim: true,
      maxLength: [100, 'Hotel name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter hotel description'],
      maxLength: [2000, 'Description cannot exceed 2000 characters'],
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: [true, 'Please enter city'] },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      zipCode: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
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
          'Wi-Fi',
          'Parking',
          'Pool',
          'Gym',
          'Restaurant',
          'Bar',
          'Room Service',
          'Laundry',
          'Airport Shuttle',
          'Spa',
          'Pet Friendly',
          'Air Conditioning',
          'Heating',
          'TV',
          'Kitchen',
          'Breakfast',
          'Conference Room',
          'Business Center',
          'Elevator',
          'Wheelchair Accessible',
        ],
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    policies: {
      checkIn: { type: String, default: '14:00' },
      checkOut: { type: String, default: '12:00' },
      cancellation: { type: String, default: 'Free cancellation up to 24 hours before check-in' },
      children: { type: String, default: 'Children welcome' },
      pets: { type: String, default: 'No pets allowed' },
      smoking: { type: String, default: 'No smoking in rooms' },
      extraBed: { type: String, default: 'Extra bed available on request' },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['budget', 'standard', 'luxury'],
      default: 'standard',
    },
    starRating: {
      type: Number,
      default: 3,
      min: 1,
      max: 7,
    },
  },
  {
    timestamps: true,
  }
);

hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hotel', hotelSchema);