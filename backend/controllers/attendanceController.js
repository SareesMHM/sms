const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Teacher-Admin
exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status, remarks } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { student: studentId, date: normalizedDate },
      { status, remarks, markedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, message: 'Attendance marked', attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private/Teacher-Admin
exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { records, date } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Records array required' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.studentId, date: normalizedDate },
        update: {
          $set: {
            status: r.status,
            remarks: r.remarks || '',
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(ops);

    res.status(201).json({
      success: true,
      message: 'Bulk attendance saved',
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = { student: req.params.studentId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== req.params.studentId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const records = await Attendance.find(filter)
      .populate('markedBy', 'fullName')
      .sort('-date');

    const summary = records.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, excused: 0 }
    );

    res.json({
      success: true,
      count: records.length,
      summary,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Private/Teacher-Admin
exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const d = new Date(req.params.date);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: d, $lt: next },
    }).populate('student', 'fullName email grade schoolName profileImage');

    res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};