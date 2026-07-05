const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary storage engine - files go straight to Cloudinary, never touch local disk.
// This is required for deployment: most hosts (Render, Railway, Heroku, Vercel, etc.)
// wipe the local filesystem on every restart/redeploy, which was silently deleting
// all previously "uploaded" images.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "stayease", // all uploads grouped under one Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1600, height: 1600, crop: "limit" }], // cap size, save bandwidth
  }),
});

// File filter (extra safety net on top of allowed_formats above)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = upload;
