const express = require("express");
const router = express.Router();
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  checkAvailability,
  uploadRoomImages,
  deleteRoomImage,
} = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .get(getRooms)
  .post(protect, authorize("owner", "admin"), createRoom);

router.get("/check-availability", checkAvailability);

router
  .route("/:id")
  .get(getRoom)
  .put(protect, authorize("owner", "admin"), updateRoom)
  .delete(protect, authorize("owner", "admin"), deleteRoom);

router.post(
  "/:id/images",
  protect,
  authorize("owner", "admin"),
  upload.array("images", 5),
  uploadRoomImages,
);
router.delete(
  "/:id/images/:imageId",
  protect,
  authorize("owner", "admin"),
  deleteRoomImage,
);

module.exports = router;
