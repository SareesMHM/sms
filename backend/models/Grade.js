const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D', 'F'],
    },
    term: {
      type: String,
      enum: ['Term 1', 'Term 2', 'Term 3', 'Final'],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-calculate grade letter from marks
gradeSchema.pre('save', function (next) {
  const m = this.marks;
  if (m >= 90) this.grade = 'A+';
  else if (m >= 80) this.grade = 'A';
  else if (m >= 70) this.grade = 'B';
  else if (m >= 60) this.grade = 'C';
  else if (m >= 50) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);