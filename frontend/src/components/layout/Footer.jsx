import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">SE</span>
              </div>
              <span className="text-2xl font-bold text-white">StayEase</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted platform for finding and booking the perfect hotel
              stay. Experience comfort and luxury at the best prices.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiFacebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiTwitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiInstagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/hotels"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Browse Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              For Partners
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/register"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  List Your Hotel
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Owner Login
                </Link>
              </li>
              <li className="text-sm">Partner Support</li>
              <li className="text-sm">Become an Affiliate</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="mt-1 text-primary-400" size={16} />
                <span className="text-sm">Jharkhand, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-primary-400" size={16} />
                <span className="text-sm">+91 1800-123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-primary-400" size={16} />
                <span className="text-sm">support@stayease.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {currentYear} StayEase | Developed by Kaushal Kumar. All
            rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-sm hover:text-primary-400 cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-sm hover:text-primary-400 cursor-pointer">
              Terms of Service
            </span>
            <span className="text-sm hover:text-primary-400 cursor-pointer">
              Cookie Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;