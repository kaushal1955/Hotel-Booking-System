const express = require("express");
const router = express.Router();
const {
  createTestimonial,
  getTestimonials,
  deleteTestimonial,
} = require("../controllers/testimonialController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getTestimonials);
router.post("/", createTestimonial);
router.delete("/:id", protect, authorize("admin"), deleteTestimonial);

module.exports = router;
