const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBooking,
  getAdminBookings,
  updateBooking,
  cancelBooking,
  getOwnerBookings,
  downloadInvoice,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, createBooking);
router.get("/user", protect, getUserBookings);
router.get("/admin", protect, authorize("admin"), getAdminBookings);
router.get("/owner", protect, authorize("owner"), getOwnerBookings);
router.get("/:id", protect, getBooking);
router.get("/:id/invoice", protect, downloadInvoice);
router.put("/:id", protect, authorize("admin", "owner"), updateBooking);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
