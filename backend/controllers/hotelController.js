const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Review = require("../models/Review");
const cloudinary = require("cloudinary").v2;

// @desc    Upload hotel images
exports.uploadHotelImages = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this hotel",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image" });
    }

    const newImages = req.files.map((file) => ({
      public_id: file.filename, // Cloudinary public_id
      url: file.path, // Cloudinary secure_url (absolute HTTPS link)
    }));

    hotel.images.push(...newImages);
    await hotel.save();

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hotel image
exports.deleteHotelImage = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this hotel",
      });
    }

    const image = hotel.images.id(req.params.imageId);

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    if (image.public_id) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (err) {
        console.error("Could not remove hotel image from Cloudinary:", err);
      }
    }

    hotel.images = hotel.images.filter(
      (img) => img._id.toString() !== req.params.imageId,
    );
    await hotel.save();

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};
// @desc    Get all hotels with search, filter, sort, pagination
exports.getHotels = async (req, res, next) => {
  try {
    const queryObj = { isApproved: true, isActive: true };
    const queryCopy = { ...req.query };

    // Remove fields not for filtering
    const removeFields = ["sort", "page", "limit", "fields"];
    removeFields.forEach((field) => delete queryCopy[field]);

    // Search by city
    if (req.query.city) {
      queryObj["address.city"] = { $regex: req.query.city, $options: "i" };
      delete queryCopy.city;
    }

    // Search by hotel name
    if (req.query.name) {
      queryObj.hotelName = { $regex: req.query.name, $options: "i" };
      delete queryCopy.name;
    }

    // Price range (min/max room price across all rooms)
    if (req.query.minPrice || req.query.maxPrice) {
      // We'll filter rooms later, just pass through
      delete queryCopy.minPrice;
      delete queryCopy.maxPrice;
    }

    // Rating filter
    if (req.query.minRating) {
      queryObj.rating = { $gte: parseFloat(req.query.minRating) };
      delete queryCopy.minRating;
    }

    // Amenities filter
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(",");
      queryObj.amenities = { $all: amenities };
      delete queryCopy.amenities;
    }

    // Category filter
    if (req.query.category) {
      queryObj.category = req.query.category;
      delete queryCopy.category;
    }

    // Star rating filter
    if (req.query.starRating) {
      queryObj.starRating = { $gte: parseInt(req.query.starRating) };
      delete queryCopy.starRating;
    }

    // Featured
    if (req.query.featured) {
      queryObj.featured = req.query.featured === "true";
      delete queryCopy.featured;
    }

    // Build query
    let query = Hotel.find(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Populate owner field (exclude password)
    query = query.populate("owner", "name email phone profileImage");

    const hotels = await query;
    const total = await Hotel.countDocuments(queryObj);

    // If price filter applied, check rooms
    let filteredHotels = hotels;
    if (req.query.minPrice || req.query.maxPrice) {
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

      const hotelIds = hotels.map((h) => h._id);
      const rooms = await Room.find({
        hotel: { $in: hotelIds },
        pricePerNight: { $gte: minPrice, $lte: maxPrice },
        isAvailable: true,
      });

      const matchingHotelIds = [
        ...new Set(rooms.map((r) => r.hotel.toString())),
      ];
      filteredHotels = hotels.filter((h) =>
        matchingHotelIds.includes(h._id.toString()),
      );
    }

    // Attach starting price (cheapest available room) for each hotel
    const finalHotelIds = filteredHotels.map((h) => h._id);
    const priceRooms = await Room.find({
      hotel: { $in: finalHotelIds },
      isAvailable: true,
    }).select("hotel pricePerNight");

    const minPriceByHotel = {};
    priceRooms.forEach((r) => {
      const hid = r.hotel.toString();
      if (!minPriceByHotel[hid] || r.pricePerNight < minPriceByHotel[hid]) {
        minPriceByHotel[hid] = r.pricePerNight;
      }
    });

    const hotelsWithPrice = filteredHotels.map((h) => {
      const obj = h.toObject();
      obj.avgPrice = minPriceByHotel[h._id.toString()] || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: hotelsWithPrice.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: hotelsWithPrice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel
exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "owner",
      "name email phone profileImage",
    );

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    // Get rooms for this hotel
    const rooms = await Room.find({ hotel: hotel._id });

    // Get reviews
    const reviews = await Review.find({ hotel: hotel._id }).populate(
      "user",
      "name profileImage",
    );

    res.status(200).json({
      success: true,
      data: { hotel, rooms, reviews },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create hotel (owner/admin)
exports.createHotel = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
exports.updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    // Check ownership
    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this hotel",
      });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this hotel",
      });
    }

    // Delete associated rooms and reviews
    await Room.deleteMany({ hotel: hotel._id });
    await Review.deleteMany({ hotel: hotel._id });
    await hotel.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Hotel deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotels by owner
exports.getOwnerHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id });
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels regardless of owner/approval status (admin only)
exports.getAllHotelsAdmin = async (req, res, next) => {
  try {
    const hotels = await Hotel.find()
      .populate("owner", "name email")
      .sort("-createdAt");
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve hotel (admin)
exports.approveHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    );

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};
