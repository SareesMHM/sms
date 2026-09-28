const User = require('../models/User');

// @desc    Get all students (Admin/Teacher)
// @route   GET /api/students
// @access  Private/Admin-Teacher
exports.getAllStudents = async (req, res, next) => {
  try {
    const { grade, school, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { role: 'student' };
    if (grade) query.grade = grade;
    if (school) query.schoolName = { $regex: school, $options: 'i' };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [students, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: students.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only view own profile
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== student._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student (Admin)
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.confirmPassword;
    delete updates.role;

    const student = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student updated', student });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student (Admin)
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.deleteOne();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student active status (Admin)
// @route   PATCH /api/students/:id/toggle-status
// @access  Private/Admin
exports.toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({
      success: true,
      message: `Student ${student.isActive ? 'activated' : 'deactivated'}`,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students by grade (Admin/Teacher)
// @route   GET /api/students/grade/:grade
// @access  Private/Admin-Teacher
exports.getStudentsByGrade = async (req, res, next) => {
  try {
    const students = await User.find({
      role: 'student',
      grade: req.params.grade,
      isActive: true,
    }).select('fullName email phone grade schoolName profileImage');

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student statistics (Admin)
// @route   GET /api/students/stats/overview
// @access  Private/Admin
exports.getStudentStats = async (req, res, next) => {
  try {
    const [total, active, byGrade, byGender] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: { total, active, inactive: total - active, byGrade, byGender },
    });
  } catch (error) {
    next(error);
  }
};