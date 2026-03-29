const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program reference is required']
  },
  type: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: [true, 'Quota type is required']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats for quota is required'],
    min: [0, 'Total seats cannot be negative']
  },
  filledSeats: {
    type: Number,
    default: 0,
    min: [0, 'Filled seats cannot be negative']
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quota', quotaSchema);
