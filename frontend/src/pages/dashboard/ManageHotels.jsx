import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheck,
  FiImage,
  FiX,
} from "react-icons/fi";
import { hotelAPI } from "../../services/api";
import toast from "react-hot-toast";

const emptyForm = {
  hotelName: "",
  description: "",
  address: { street: "", city: "", state: "", country: "India", zipCode: "" },
  category: "standard",
  starRating: 3,
  amenities: [],
  featured: false,
};

const ManageHotels = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const amenityOptions = [
    "Wi-Fi",
    "Parking",
    "Pool",
    "Gym",
    "Restaurant",
    "Bar",
    "Room Service",
    "Laundry",
    "Airport Shuttle",
    "Spa",
    "Pet Friendly",
    "Air Conditioning",
    "TV",
    "Breakfast",
    "Elevator",
  ];

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const { data } = isAdmin
        ? await hotelAPI.getAllHotelsAdmin()
        : await hotelAPI.getOwnerHotels();
      setHotels(data.data);
    } catch (err) {
      toast.error("Failed to load hotels");
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await hotelAPI.approveHotel(id);
      toast.success("Hotel approved");
      loadHotels();
    } catch (err) {
      toast.error("Failed to approve hotel");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setExistingImages([]);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let hotelId = editing;
      if (editing) {
        await hotelAPI.updateHotel(editing, form);
        toast.success("Hotel updated");
      } else {
        const res = await hotelAPI.createHotel(form);
        hotelId = res.data.data._id;
        toast.success("Hotel created");
      }

      if (newImageFiles.length > 0 && hotelId) {
        setUploadingImages(true);
        try {
          const formData = new FormData();
          newImageFiles.forEach((file) => formData.append("images", file));
          await hotelAPI.uploadHotelImages(hotelId, formData);
        } catch (err) {
          toast.error(
            err.response?.data?.message ||
              "Hotel saved, but image upload failed",
          );
        }
        setUploadingImages(false);
      }

      setShowForm(false);
      setEditing(null);
      resetForm();
      loadHotels();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save hotel");
    }
  };

  const handleEdit = (hotel) => {
    setForm({
      hotelName: hotel.hotelName,
      description: hotel.description,
      address: hotel.address,
      category: hotel.category,
      starRating: hotel.starRating,
      amenities: hotel.amenities,
      featured: hotel.featured,
    });
    setExistingImages(hotel.images || []);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setEditing(hotel._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel and all its rooms?")) return;
    try {
      await hotelAPI.deleteHotel(id);
      toast.success("Hotel deleted");
      loadHotels();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    if (!editing) return;
    if (!window.confirm("Remove this image?")) return;
    try {
      await hotelAPI.deleteHotelImage(editing, imageId);
      setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
      toast.success("Image removed");
      loadHotels();
    } catch (err) {
      toast.error("Failed to remove image");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Hotels</h1>
        {!isAdmin && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              resetForm();
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus /> <span>{showForm ? "Cancel" : "Add Hotel"}</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold mb-4">
            {editing ? "Edit Hotel" : "Add New Hotel"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={form.hotelName}
                  onChange={(e) =>
                    setForm({ ...form, hotelName: e.target.value })
                  }
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={form.address.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, city: e.target.value },
                    })
                  }
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={form.address.state}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, state: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Star Rating
                </label>
                <select
                  value={form.starRating}
                  onChange={(e) =>
                    setForm({ ...form, starRating: parseInt(e.target.value) })
                  }
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      {n} Star
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  value={form.address.street}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, street: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                className="input-field"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.amenities.includes(amenity) ? "bg-primary-50 border-primary-300 text-primary-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel Images
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {existingImages.map((img) => (
                  <div
                    key={img._id}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border group"
                  >
                    <img
                      src={img.url}
                      alt="Hotel"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img._id)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((src, idx) => (
                  <div
                    key={src}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary-300 group"
                  >
                    <img
                      src={src}
                      alt="New upload"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 cursor-pointer">
                  <FiImage size={20} />
                  <span className="text-xs mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400">
                JPEG, PNG, GIF or WebP. Max 5MB per image, up to 5 per upload.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="featured" className="text-sm">
                Featured Hotel
              </label>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploadingImages}
            >
              {uploadingImages
                ? "Uploading images..."
                : editing
                  ? "Update Hotel"
                  : "Create Hotel"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Hotel</th>
                <th className="text-left p-4">City</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          hotel.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100"
                        }
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="font-medium">{hotel.hotelName}</span>
                    </div>
                  </td>
                  <td className="p-4">{hotel.address?.city}</td>
                  <td className="p-4 capitalize">{hotel.category}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${hotel.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {hotel.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Link
                        to={`/hotels/${hotel._id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        <FiEye size={16} />
                      </Link>
                      <Link
                        to={`/dashboard/hotels/${hotel._id}/rooms`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-xs"
                      >
                        Rooms
                      </Link>
                      {isAdmin && !hotel.isApproved && (
                        <button
                          onClick={() => handleApprove(hotel._id)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                          title="Approve hotel"
                        >
                          <FiCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hotel._id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-red-600"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hotels.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hotels added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageHotels;
