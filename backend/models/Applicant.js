const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Applicant name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  category: {
    type: String,
    enum: ['GM', 'SC', 'ST', 'OBC', 'Others'],
    required: [true, 'Category is required']
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: [true, 'Entry type is required']
  },
  quotaType: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: [true, 'Quota type is required']
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative']
  },
  documentsStatus: {
    type: String,
    enum: ['Pending', 'Submitted', 'Verified'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);
