const express = require("express");
const router = express.Router();
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getOwnerHotels,
  getAllHotelsAdmin,
  approveHotel,
  uploadHotelImages,
  deleteHotelImage,
} = require("../controllers/hotelController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .get(getHotels)
  .post(protect, authorize("owner", "admin"), createHotel);

router.get("/owner", protect, authorize("owner", "admin"), getOwnerHotels);
router.get("/admin/all", protect, authorize("admin"), getAllHotelsAdmin);
router.put("/:id/approve", protect, authorize("admin"), approveHotel);

router.post(
  "/:id/images",
  protect,
  authorize("owner", "admin"),
  upload.array("images", 5),
  uploadHotelImages,
);
router.delete(
  "/:id/images/:imageId",
  protect,
  authorize("owner", "admin"),
  deleteHotelImage,
);

router
  .route("/:id")
  .get(getHotel)
  .put(protect, authorize("owner", "admin"), updateHotel)
  .delete(protect, authorize("owner", "admin"), deleteHotel);

module.exports = router;
