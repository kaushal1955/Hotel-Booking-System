const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadProfileImage,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post(
  "/profile-image",
  protect,
  upload.single("image"),
  uploadProfileImage,
);
router.put("/update-password", protect, updatePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:hotelId", protect, addToWishlist);
router.delete("/wishlist/:hotelId", protect, removeFromWishlist);

module.exports = router;
