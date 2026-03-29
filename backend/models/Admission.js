const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: [true, 'Applicant reference is required'],
    unique: true // One admission per applicant
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program reference is required']
  },
  quotaType: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: [true, 'Quota type is required']
  },
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true // Allows null/missing values until generated, but must be unique when present
  },
  feeStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Allocated', 'Confirmed'],
    default: 'Allocated'
  }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
