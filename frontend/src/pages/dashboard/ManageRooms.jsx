import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiImage, FiX } from 'react-icons/fi';
import { roomAPI, hotelAPI } from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  roomNumber: '', roomType: 'single', capacity: 1, pricePerNight: '', maxGuests: 1,
  amenities: [], description: '', isAvailable: true, bedType: 'double',
};

const ManageRooms = () => {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const roomTypes = ['single', 'double', 'twin', 'suite', 'deluxe', 'penthouse', 'family'];
  const roomAmenities = ['AC', 'Non-AC', 'Wi-Fi', 'TV', 'Breakfast', 'Bathroom', 'Balcony', 'Mini Bar', 'Safe', 'Work Desk'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [roomsRes, hotelRes] = await Promise.all([
        roomAPI.getRooms({ hotelId }),
        hotelAPI.getHotel(hotelId),
      ]);
      setRooms(roomsRes.data.data);
      setHotel(hotelRes.data.data.hotel);
    } catch (err) { toast.error('Failed to load'); }
    setLoading(false);
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
      const data = { ...form, hotel: hotelId, pricePerNight: parseInt(form.pricePerNight) };
      let roomId = editing;
      if (editing) {
        await roomAPI.updateRoom(editing, data);
        toast.success('Room updated');
      } else {
        const res = await roomAPI.createRoom(data);
        roomId = res.data.data._id;
        toast.success('Room created');
      }

      if (newImageFiles.length > 0 && roomId) {
        setUploadingImages(true);
        try {
          const formData = new FormData();
          newImageFiles.forEach((file) => formData.append('images', file));
          await roomAPI.uploadRoomImages(roomId, formData);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Room saved, but image upload failed');
        }
        setUploadingImages(false);
      }

      setShowForm(false); setEditing(null);
      resetForm();
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (room) => {
    setForm({
      roomNumber: room.roomNumber, roomType: room.roomType, capacity: room.capacity,
      pricePerNight: room.pricePerNight, maxGuests: room.maxGuests, amenities: room.amenities,
      description: room.description, isAvailable: room.isAvailable, bedType: room.bedType,
    });
    setExistingImages(room.images || []);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setEditing(room._id);
    setShowForm(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    if (!editing) return;
    if (!window.confirm('Remove this image?')) return;
    try {
      await roomAPI.deleteRoomImage(editing, imageId);
      setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
      toast.success('Image removed');
      loadData();
    } catch (err) { toast.error('Failed to remove image'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomAPI.deleteRoom(id);
      toast.success('Room deleted');
      loadData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const toggleAmenity = (am) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(am) ? prev.amenities.filter((a) => a !== am) : [...prev.amenities, am],
    }));
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/dashboard/hotels" className="p-2 rounded-lg hover:bg-gray-100"><FiArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold">Manage Rooms</h1>
          {hotel && <p className="text-sm text-gray-500">{hotel.hotelName} - {hotel.address?.city}</p>}
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }} className="btn-primary flex items-center space-x-2 ml-auto">
          <FiPlus /> <span>{showForm ? 'Cancel' : 'Add Room'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold mb-4">{editing ? 'Edit Room' : 'Add New Room'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input type="text" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} className="input-field">
                  {roomTypes.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₹)</label>
                <input type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                <input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) })} min="1" max="20" required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                <select value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} className="input-field">
                  {['single', 'double', 'queen', 'king', 'twin', 'bunk'].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="rounded" />
                <label htmlFor="isAvailable" className="text-sm">Available</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {roomAmenities.map((am) => (
                  <button key={am} type="button" onClick={() => toggleAmenity(am)} className={`px-3 py-1.5 rounded-lg text-sm border ${form.amenities.includes(am) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{am}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Images</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {existingImages.map((img) => (
                  <div key={img._id} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                    <img src={img.url} alt="Room" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(img._id)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((src, idx) => (
                  <div key={src} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary-300 group">
                    <img src={src} alt="New upload" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 cursor-pointer">
                  <FiImage size={20} />
                  <span className="text-xs mt-1">Add</span>
                  <input type="file" accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" multiple className="hidden" onChange={handleImageSelect} />
                </label>
              </div>
              <p className="text-xs text-gray-400">JPEG, PNG, GIF or WebP. Max 5MB per image.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field"></textarea>
            </div>
            <button type="submit" className="btn-primary" disabled={uploadingImages}>
              {uploadingImages ? 'Uploading images...' : editing ? 'Update Room' : 'Create Room'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Room</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Guests</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {room.images && room.images.length > 0 ? (
                      <img src={room.images[0].url} alt={`Room ${room.roomNumber}`} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                        <FiImage size={18} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">Room {room.roomNumber}</td>
                  <td className="p-4 capitalize">{room.roomType}</td>
                  <td className="p-4">₹{room.pricePerNight}</td>
                  <td className="p-4">{room.maxGuests}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {room.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(room)} className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(room._id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-600"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No rooms added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;