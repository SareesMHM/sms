const Announcement = require('../models/Announcement');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin-Teacher
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetRole, targetGrade, priority, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      targetRole: targetRole || 'all',
      targetGrade: targetGrade || 'all',
      priority: priority || 'normal',
      expiresAt,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Announcement created', announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcements (filtered by user role)
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res, next) => {
  try {
    const filter = {
      isActive: true,
      $or: [{ targetRole: 'all' }, { targetRole: req.user.role }],
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } },
          ],
        },
      ],
    };

    if (req.user.role === 'student' && req.user.grade) {
      filter.$and.push({
        $or: [{ targetGrade: 'all' }, { targetGrade: req.user.grade }],
      });
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'fullName role')
      .sort('-createdAt');

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, message: 'Updated', announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    await announcement.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};