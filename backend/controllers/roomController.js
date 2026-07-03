const fs = require("fs");
const path = require("path");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

// @desc    Get all rooms (with filtering)
exports.getRooms = async (req, res, next) => {
  try {
    const queryObj = {};

    if (req.query.hotelId) {
      queryObj.hotel = req.query.hotelId;
    }

    if (req.query.roomType) {
      queryObj.roomType = req.query.roomType;
    }

    if (req.query.isAvailable !== undefined) {
      queryObj.isAvailable = req.query.isAvailable === "true";
    }

    if (req.query.minCapacity) {
      queryObj.capacity = { $gte: parseInt(req.query.minCapacity) };
    }

    if (req.query.maxGuests) {
      queryObj.maxGuests = { $gte: parseInt(req.query.maxGuests) };
    }

    const rooms = await Room.find(queryObj).populate(
      "hotel",
      "hotelName address images",
    );

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "hotel",
      "hotelName address images starRating",
    );

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room
exports.createRoom = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.body.hotel);

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    // Check ownership
    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add rooms to this hotel",
        });
    }

    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this room",
        });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this room",
        });
    }

    await room.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload room images
exports.uploadRoomImages = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this room",
        });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image" });
    }

    const newImages = req.files.map((file) => ({
      public_id: file.filename,
      url: `/uploads/${file.filename}`,
    }));

    room.images.push(...newImages);
    await room.save();

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room image
exports.deleteRoomImage = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this room",
        });
    }

    const image =
      room.images.id(req.params.imageId) ||
      room.images.find((img) => img._id.toString() === req.params.imageId);

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    // Remove file from disk (ignore errors if already missing)
    if (image.public_id) {
      const filePath = path.join(__dirname, "../uploads", image.public_id);
      fs.unlink(filePath, () => {});
    }

    room.images = room.images.filter(
      (img) => img._id.toString() !== req.params.imageId,
    );
    await room.save();

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Check room availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    const Booking = require("../models/Booking");
    const room = await Room.findById(roomId);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      room: roomId,
      bookingStatus: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
        },
      ],
    });

    const isAvailable = conflictingBookings.length === 0 && room.isAvailable;

    res.status(200).json({
      success: true,
      isAvailable,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};
