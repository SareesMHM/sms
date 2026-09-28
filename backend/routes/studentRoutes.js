const express = require('express');
const router = express.Router();
const {
  getAllStudents, getStudentById, updateStudent, deleteStudent,
  toggleStudentStatus, getStudentsByGrade, getStudentStats,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats/overview', protect, authorize('admin'), getStudentStats);
router.get('/grade/:grade', protect, authorize('admin', 'teacher'), getStudentsByGrade);
router.get('/', protect, authorize('admin', 'teacher'), getAllStudents);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, authorize('admin'), updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleStudentStatus);

module.exports = router;