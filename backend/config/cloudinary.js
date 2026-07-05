const cloudinary = require("cloudinary").v2;

const cloudinaryConfig = () => {
  if (process.env.CLOUDINARY_URL) {
    // cloudinary SDK automatically reads CLOUDINARY_URL from env — nothing else needed
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
};

module.exports = cloudinaryConfig;
