const express = require('express');
const router = express.Router();
const {
  markAttendance, bulkMarkAttendance, getStudentAttendance, getAttendanceByDate,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'teacher'), markAttendance);
router.post('/bulk', protect, authorize('admin', 'teacher'), bulkMarkAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);
router.get('/date/:date', protect, authorize('admin', 'teacher'), getAttendanceByDate);

module.exports = router;