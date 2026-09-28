const express = require('express');
const router = express.Router();
const {
  createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'teacher'), createAnnouncement);
router.get('/', protect, getAnnouncements);
router.put('/:id', protect, authorize('admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;