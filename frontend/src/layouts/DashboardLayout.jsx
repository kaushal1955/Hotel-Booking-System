import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiMenu, FiX, FiHome, FiMapPin, FiUsers, FiBookOpen, FiCreditCard, FiDollarSign, FiLogOut, FiUser } from 'react-icons/fi';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/dashboard/hotels', icon: FiMapPin, label: 'Hotels', roles: ['admin', 'owner'] },
    { to: '/dashboard/bookings', icon: FiBookOpen, label: 'Bookings', roles: ['admin', 'owner'] },
    { to: '/dashboard/users', icon: FiUsers, label: 'Users', roles: ['admin'] },
    { to: '/dashboard/payments', icon: FiCreditCard, label: 'Payments', roles: ['admin'] },
    { to: '/dashboard/earnings', icon: FiDollarSign, label: 'Earnings', roles: ['owner'] },
  ];

  const filteredNav = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="text-xl font-bold text-gray-800">StayEase</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between lg:justify-end">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <FiMenu size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="text-sm text-primary-600 hover:underline">
              View Site
            </NavLink>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
