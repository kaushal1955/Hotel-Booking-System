const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Payment = require('../models/Payment');
const PDFDocument = require("pdfkit");
// @desc    Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { hotel, room, checkInDate, checkOutDate, guests, specialRequests, couponCode } = req.body;

    const hotelData = await Hotel.findById(hotel);
    if (!hotelData) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!roomData.isAvailable) {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    if (guests > roomData.maxGuests) {
      return res.status(400).json({ success: false, message: `Room max capacity is ${roomData.maxGuests} guests` });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    if (checkIn < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: 'Cannot book for past dates' });
    }

    // Check for conflicting bookings
    const conflicting = await Booking.findOne({
      room,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
      ],
    });

    if (conflicting) {
      return res.status(400).json({ success: false, message: 'Room is already booked for these dates' });
    }

    // Calculate nights
    const nightsCount = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    let totalAmount = roomData.pricePerNight * nightsCount;
    let discountAmount = 0;

    // Basic coupon logic
    if (couponCode) {
      const validCoupons = {
        'WELCOME10': { discount: 10, type: 'percentage' },
        'STAY20': { discount: 20, type: 'percentage' },
        'FLAT500': { discount: 500, type: 'flat' },
      };

      const coupon = validCoupons[couponCode.toUpperCase()];
      if (coupon) {
        if (coupon.type === 'percentage') {
          discountAmount = (totalAmount * coupon.discount) / 100;
        } else {
          discountAmount = Math.min(coupon.discount, totalAmount);
        }
      }
    }

    totalAmount -= discountAmount;

    const booking = await Booking.create({
      user: req.user.id,
      hotel,
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalAmount,
      discountAmount,
      couponCode: couponCode || '',
      nightsCount,
      specialRequests: specialRequests || '',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('hotel', 'hotelName address.city images starRating')
      .populate('room', 'roomNumber roomType pricePerNight images')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'hotelName address images policies starRating')
      .populate('room', 'roomNumber roomType pricePerNight images amenities')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Download invoice PDF for a paid booking
exports.downloadInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hotel", "hotelName address")
      .populate("room", "roomNumber roomType pricePerNight")
      .populate("user", "name email phone");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (booking.paymentStatus !== "paid") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invoice is only available after payment",
        });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const filename = `${booking.invoiceNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    doc.fontSize(22).font("Helvetica-Bold").text("StayEase", 50, 50);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666")
      .text("Hotel booking receipt", 50, 76);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("INVOICE", 400, 50, { align: "right" });
    doc.fontSize(10).font("Helvetica").fillColor("#666");
    doc.text(`Invoice #: ${booking.invoiceNumber}`, 400, 74, {
      align: "right",
    });
    doc.text(`Date: ${formatDate(booking.createdAt)}`, 400, 88, {
      align: "right",
    });

    doc.moveTo(50, 115).lineTo(545, 115).strokeColor("#e5e7eb").stroke();

    doc
      .fillColor("#000")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Billed to", 50, 135);
    doc.fontSize(10).font("Helvetica").fillColor("#333");
    doc.text(booking.user?.name || "-", 50, 152);
    doc.text(booking.user?.email || "-", 50, 167);
    if (booking.user?.phone) doc.text(booking.user.phone, 50, 182);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Stay details", 320, 135);
    doc.fontSize(10).font("Helvetica").fillColor("#333");
    doc.text(booking.hotel?.hotelName || "-", 320, 152);
    const cityLine = [
      booking.hotel?.address?.city,
      booking.hotel?.address?.state,
    ]
      .filter(Boolean)
      .join(", ");
    if (cityLine) doc.text(cityLine, 320, 167);
    doc.text(`Check-in: ${formatDate(booking.checkInDate)}`, 320, 182);
    doc.text(`Check-out: ${formatDate(booking.checkOutDate)}`, 320, 197);

    let y = 240;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e7eb").stroke();
    y += 12;
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#000");
    doc.text("Description", 50, y);
    doc.text("Qty", 340, y, { width: 60, align: "right" });
    doc.text("Amount", 465, y, { width: 80, align: "right" });
    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e7eb").stroke();
    y += 12;

    doc.fontSize(10).font("Helvetica").fillColor("#333");
    doc.text(
      `${booking.room?.roomType || "Room"} - Room ${booking.room?.roomNumber || ""} (${money(booking.room?.pricePerNight)}/night)`,
      50,
      y,
      { width: 270 },
    );
    doc.text(
      `${booking.nightsCount} night${booking.nightsCount > 1 ? "s" : ""}`,
      340,
      y,
      { width: 60, align: "right" },
    );
    doc.text(money(booking.room?.pricePerNight * booking.nightsCount), 465, y, {
      width: 80,
      align: "right",
    });
    y += 26;

    if (booking.discountAmount > 0) {
      doc.fillColor("#16a34a");
      doc.text(
        `Discount${booking.couponCode ? ` (${booking.couponCode})` : ""}`,
        50,
        y,
        { width: 270 },
      );
      doc.text(`-${money(booking.discountAmount)}`, 465, y, {
        width: 80,
        align: "right",
      });
      doc.fillColor("#333");
      y += 22;
    }

    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e7eb").stroke();
    y += 14;

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000");
    doc.text("Total paid", 340, y, { width: 60, align: "right" });
    doc.text(money(booking.totalAmount), 465, y, { width: 80, align: "right" });

    y += 40;
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#16a34a")
      .text("Payment status: Paid", 50, y);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#999")
      .text(
        "This is a system-generated invoice and does not require a signature.",
        50,
        760,
        { width: 495, align: "center" },
      );

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
exports.getAdminBookings = async (req, res, next) => {
  try {
    const queryObj = {};

    if (req.query.status) {
      queryObj.bookingStatus = req.query.status;
    }

    if (req.query.paymentStatus) {
      queryObj.paymentStatus = req.query.paymentStatus;
    }

    const bookings = await Booking.find(queryObj)
      .populate('user', 'name email phone')
      .populate('hotel', 'hotelName address.city')
      .populate('room', 'roomNumber roomType')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['cancelled', 'completed', 'refunded'].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.bookingStatus}` });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Update payment records
    await Payment.updateMany(
      { booking: booking._id },
      { status: 'refunded' }
    );

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner bookings (for hotel owners)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id });
    const hotelIds = hotels.map((h) => h._id);

    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('user', 'name email phone')
      .populate('hotel', 'hotelName')
      .populate('room', 'roomNumber roomType')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};