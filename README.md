# StayEase - Full Stack Hotel Booking Management System

A modern full-stack web application for searching, comparing, and booking hotels online with real-time room availability, user authentication, payment processing, and an admin dashboard.

## 🏗️ Tech Stack

### Frontend
- **React.js** with **Vite** - UI library & build tool
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Chart.js 2** - Charts & graphs
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **React DatePicker** - Date selection

### Backend
- **Node.js** & **Express.js** - Server & API
- **MongoDB** with **Mongoose ODM** - Database
- **JWT** - Authentication
- **bcrypt.js** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Razorpay / Stripe** - Payment gateways
- **Nodemailer** - Email service

## 📁 Project Structure

```
hotel-booking-system/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   ├── auth/
│   │   │   ├── hotel/
│   │   │   ├── booking/
│   │   │   ├── user/
│   │   │   └── dashboard/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── package.json
│
├── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hotel-booking-system.git
   cd hotel-booking-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   ```bash
   # Edit .env file with your credentials
   cp .env.example .env
   ```

4. **Run the application**
   ```bash
   # Run both frontend and backend concurrently
   npm run dev
   
   # Or run separately:
   npm run dev:backend   # Backend on http://localhost:5000
   npm run dev:frontend  # Frontend on http://localhost:5173
   ```

## 🌟 Features

### User Roles
- **Guest** - Browse hotels, search, register
- **Customer** - Book rooms, manage bookings, reviews, wishlist
- **Hotel Owner** - Manage hotels, rooms, view earnings
- **Admin** - Full system control, manage users, approve hotels, generate reports

### Core Features
- 🔐 **Authentication** - JWT-based, role-based access, password reset, email verification
- 🏨 **Hotel Management** - CRUD operations, image uploads, amenity management
- 🛏️ **Room Management** - Room types, pricing, availability tracking
- 🔍 **Advanced Search** - Filter by city, price, rating, amenities, dates
- 📅 **Booking System** - Date selection, availability check, coupon codes
- 💳 **Payments** - Razorpay & Stripe integration, multiple payment methods
- ⭐ **Reviews & Ratings** - User reviews with ratings
- ❤️ **Wishlist** - Save favorite hotels
- 📊 **Admin Dashboard** - Real-time stats, revenue charts, booking trends
- 👥 **User Management** - CRUD, suspend/block users
- 📈 **Reports** - Revenue reports, occupancy rates

### Security
- JWT authentication with HTTP-only cookies
- bcrypt password hashing
- Role-Based Access Control (RBAC)
- Input validation & sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- MongoDB injection prevention

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/update-password` | Update password |
| POST | `/api/auth/forgot-password` | Forgot password |
| PUT | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/verify-email/:token` | Verify email |
| GET/POST/DELETE | `/api/auth/wishlist/:hotelId` | Wishlist management |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | Get all hotels (with filters) |
| GET | `/api/hotels/:id` | Get single hotel |
| POST | `/api/hotels` | Create hotel (owner/admin) |
| PUT | `/api/hotels/:id` | Update hotel |
| DELETE | `/api/hotels/:id` | Delete hotel |
| GET | `/api/hotels/owner` | Get owner's hotels |
| PUT | `/api/hotels/:id/approve` | Approve hotel (admin) |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/rooms/:id` | Get single room |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| GET | `/api/rooms/check-availability` | Check availability |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/user` | Get user's bookings |
| GET | `/api/bookings/admin` | Get all bookings (admin) |
| GET | `/api/bookings/owner` | Get owner's bookings |
| PUT | `/api/bookings/:id` | Update booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create` | Create payment |
| POST | `/api/payments/verify` | Verify payment |
| POST | `/api/payments/refund/:bookingId` | Refund payment |
| GET | `/api/payments/booking/:bookingId` | Get payment by booking |
| GET | `/api/payments` | Get all payments (admin) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create review |
| GET | `/api/reviews/:hotelId` | Get hotel reviews |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get single user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/toggle-status` | Toggle user status |
| GET | `/api/admin/revenue` | Revenue report |

## 📊 Database Collections

- **User** - User accounts, roles, wishlist
- **Hotel** - Hotel details, amenities, policies
- **Room** - Room types, pricing, availability
- **Booking** - Booking records, status tracking
- **Payment** - Payment transactions, refunds
- **Review** - User reviews and ratings

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stayease.com | password123 |
| Owner | owner@stayease.com | password123 |
| Customer | user@stayease.com | password123 |

## 🔮 Future Enhancements

- AI-powered hotel recommendations
- Dynamic pricing based on demand
- Loyalty rewards program
- Multi-language support
- Dark mode
- Live chat support
- Voice search
- Travel package integration
- Flight and hotel combo booking
- QR code check-in
- Push notifications
- Mobile app (React Native/Flutter)
- Analytics dashboard with predictive insights

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React community
- MongoDB Atlas
- Cloudinary
- Razorpay / Stripe