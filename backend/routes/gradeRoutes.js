const express = require('express');
const router = express.Router();
const {
  addGrade, getStudentGrades, updateGrade, deleteGrade,
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'teacher'), addGrade);
router.get('/student/:studentId', protect, getStudentGrades);
router.put('/:id', protect, authorize('admin', 'teacher'), updateGrade);
router.delete('/:id', protect, authorize('admin'), deleteGrade);

module.exports = router;