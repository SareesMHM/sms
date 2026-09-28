const Grade = require('../models/Grade');
const User = require('../models/User');

// @desc    Add grade
// @route   POST /api/grades
// @access  Private/Teacher-Admin
exports.addGrade = async (req, res, next) => {
  try {
    const { studentId, subject, marks, term, year, remarks } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const grade = await Grade.create({
      student: studentId,
      subject,
      marks,
      term,
      year,
      remarks,
      addedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Grade added', grade });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grades by student
// @route   GET /api/grades/student/:studentId
// @access  Private
exports.getStudentGrades = async (req, res, next) => {
  try {
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== req.params.studentId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const grades = await Grade.find({ student: req.params.studentId })
      .populate('addedBy', 'fullName')
      .sort('-year -createdAt');

    const average =
      grades.length > 0
        ? grades.reduce((s, g) => s + g.marks, 0) / grades.length
        : 0;

    res.json({
      success: true,
      count: grades.length,
      average: average.toFixed(2),
      grades,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private/Teacher-Admin
exports.updateGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    res.json({ success: true, message: 'Grade updated', grade });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin
exports.deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    await grade.deleteOne();
    res.json({ success: true, message: 'Grade deleted' });
  } catch (error) {
    next(error);
  }
};