import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiMail, FiPhone, FiSave, FiCamera } from "react-icons/fi";
import { updateUserState } from "../../store/slices/authSlice";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ name: form.name, phone: form.phone });
      dispatch(updateUserState(data.data));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    }
    setSaving(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, GIF or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await authAPI.uploadProfileImage(formData);
      dispatch(updateUserState({ profileImage: data.data.profileImage }));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not upload image");
    }
    setUploadingImage(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800" />

          <div className="px-8 pb-8">
            <div className="flex items-end -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user?.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-600">
                      {user?.name?.[0] || "?"}
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                onClick={handleImageClick}
                disabled={uploadingImage}
                className="ml-4 mb-2 p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 disabled:opacity-50"
              >
                <FiCamera className="text-gray-500" />
              </button>
              <button
                onClick={() => setEditing(!editing)}
                className="ml-auto mb-2 btn-outline text-sm"
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiSave />{" "}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user?.name}
                  </h2>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full font-medium capitalize">
                      {user?.role}
                    </span>
                    {user?.isVerified && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FiMail className="text-gray-400" />{" "}
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FiPhone className="text-gray-400" />{" "}
                    <span>{user?.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <a
            href="/bookings"
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow block"
          >
            <h3 className="font-semibold text-gray-800">My Bookings</h3>
            <p className="text-sm text-gray-500 mt-1">
              View your booking history
            </p>
          </a>
          <a
            href="/wishlist"
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow block"
          >
            <h3 className="font-semibold text-gray-800">Wishlist</h3>
            <p className="text-sm text-gray-500 mt-1">Your saved hotels</p>
          </a>
          <a
            href="/hotels"
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow block"
          >
            <h3 className="font-semibold text-gray-800">Browse Hotels</h3>
            <p className="text-sm text-gray-500 mt-1">Discover new stays</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
