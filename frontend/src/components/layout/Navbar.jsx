import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiBookOpen, FiGrid } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/hotels', label: 'Hotels' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">SE</span>
            </div>
            <span className={`text-2xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
              StayEase
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? scrolled
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-white/20 text-white'
                      : scrolled
                      ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/wishlist"
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled ? 'text-gray-600 hover:text-red-500 hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiHeart size={20} />
                </Link>
                <Link
                  to="/bookings"
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled ? 'text-gray-600 hover:text-primary-600 hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiBookOpen size={20} />
                </Link>
                {(user.role === 'admin' || user.role === 'owner') && (
                  <Link
                    to="/dashboard"
                    className={`p-2 rounded-lg transition-colors ${
                      scrolled ? 'text-gray-600 hover:text-primary-600 hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FiGrid size={20} />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    scrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <FiUser size={18} />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-red-200 hover:text-red-100 hover:bg-white/10'
                  }`}
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-white text-primary-700 hover:bg-gray-100'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 bg-white rounded-xl shadow-xl p-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2" />
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-500">
                  Signed in as <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiUser size={18} /> <span>Profile</span>
                </Link>
                <Link
                  to="/bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiBookOpen size={18} /> <span>My Bookings</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiHeart size={18} /> <span>Wishlist</span>
                </Link>
                {(user.role === 'admin' || user.role === 'owner') && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiGrid size={18} /> <span>Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <FiLogOut size={18} /> <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm bg-primary-600 text-white text-center hover:bg-primary-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;