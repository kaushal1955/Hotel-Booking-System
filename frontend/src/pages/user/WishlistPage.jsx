import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiStar, FiTrash2 } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const { data } = await authAPI.getWishlist();
      setWishlist(data.data || []);
    } catch (err) {
      // ignore
    }
    setLoading(false);
  };

  const handleRemove = async (hotelId) => {
    try {
      await authAPI.removeFromWishlist(hotelId);
      setWishlist(wishlist.filter((h) => h._id !== hotelId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <FiHeart className="text-red-500" size={28} />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FiHeart className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save hotels you love to your wishlist.</p>
            <Link to="/hotels" className="btn-primary">Explore Hotels</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((hotel) => (
              <div key={hotel._id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                <Link to={`/hotels/${hotel._id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <img src={hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'} alt={hotel.hotelName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{hotel.hotelName}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center"><FiMapPin size={14} className="mr-1" />{hotel.address?.city}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (<FiStar key={s} size={14} className={s <= (hotel.starRating || 3) ? 'text-secondary-500 fill-current' : 'text-gray-300'} />))}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button onClick={() => handleRemove(hotel._id)} className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-600">
                    <FiTrash2 size={14} /> <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;