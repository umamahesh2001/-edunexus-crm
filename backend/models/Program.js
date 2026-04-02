const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department reference is required']
  },
  courseType: {
    type: String,
    enum: ['UG', 'PG'],
    required: [true, 'Course type (UG/PG) is required']
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: [true, 'Entry type is required']
  },
  admissionMode: {
    type: String,
    enum: ['Government', 'Management', 'Both'],
    default: 'Both'
  },
  academicYear: {
    type: String, // e.g., '2026-2027'
    required: [true, 'Academic year is required']
  },
  totalIntake: {
    type: Number,
    required: [true, 'Total intake is required'],
    min: [1, 'Total intake must be greater than 0']
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
