const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getRevenueReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/revenue', getRevenueReport);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;