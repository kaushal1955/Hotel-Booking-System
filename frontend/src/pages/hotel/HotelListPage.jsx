import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../../store/slices/hotelSlice';
import { FiMapPin, FiStar, FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const HotelListPage = () => {
  const dispatch = useDispatch();
  const { hotels, loading, total, totalPages, currentPage } = useSelector((state) => state.hotels);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    name: searchParams.get('name') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-rating',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    dispatch(fetchHotels(params));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: '1' }));
  };

  const clearFilters = () => {
    setFilters({ city: '', name: '', minPrice: '', maxPrice: '', minRating: '', category: '', sort: '-rating', page: '1' });
  };

  const hasFilters = Object.values(filters).some((v) => v && v !== '-rating' && v !== '1');

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hotels</h1>
            <p className="text-gray-500 mt-1">{total} hotels found</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline flex items-center space-x-2 mt-4 md:mt-0">
            <FiSliders /> <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">Clear all</button>
              </div>

              {/* Search by name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} placeholder="Search..." className="input-field pl-10 text-sm" />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} placeholder="e.g. Mumbai" className="input-field text-sm" />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (per night)</label>
                <div className="flex space-x-2">
                  <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} placeholder="Min" className="input-field text-sm w-1/2" />
                  <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} placeholder="Max" className="input-field text-sm w-1/2" />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="input-field text-sm">
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="input-field text-sm">
                  <option value="">All</option>
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="input-field text-sm">
                  <option value="-rating">Highest Rated</option>
                  <option value="rating">Lowest Rated</option>
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="hotelName">Name (A-Z)</option>
                  <option value="-hotelName">Name (Z-A)</option>
                </select>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="btn-danger w-full text-sm">Clear All Filters</button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
              </div>
            ) : hotels.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No hotels found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria.</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {hotels.map((hotel, idx) => (
                    <motion.div key={hotel._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                      <Link to={`/hotels/${hotel._id}`} className="card block overflow-hidden group">
                        <div className="relative h-48 overflow-hidden">
                          <img src={hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'} alt={hotel.hotelName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-semibold">★ {hotel.rating || 'New'}</div>
                          {hotel.featured && <div className="absolute top-3 left-3 bg-secondary-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">Featured</div>}
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{hotel.hotelName}</h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center"><FiMapPin size={14} className="mr-1" />{hotel.address?.city}, {hotel.address?.state}</p>
                            </div>
                            <span className="text-xs capitalize bg-gray-100 px-2 py-1 rounded">{hotel.category}</span>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((s) => (<FiStar key={s} size={14} className={s <= hotel.starRating ? 'text-secondary-500 fill-current' : 'text-gray-300'} />))}
                            </div>
                            <div className="text-right">
                              <span className="text-gray-400 text-xs">From</span>
                              <p className="text-primary-600 font-bold">
                                {hotel.avgPrice ? `₹${hotel.avgPrice}` : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page.toString())}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          parseInt(filters.page) === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListPage;