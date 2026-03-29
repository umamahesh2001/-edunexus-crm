const Admission = require('../models/Admission');
const Quota = require('../models/Quota');
const Applicant = require('../models/Applicant');
const Program = require('../models/Program');
const Institution = require('../models/Institution');
const Counter = require('../models/Counter');

// Generate Unique ID logically Sequence + Strings
const generateAdmissionNumber = async (programId, quotaType) => {
  const program = await Program.findById(programId).populate('departmentId');
  if(!program) throw new Error('Program not found');
  
  // Format: INST/YYYY/COURSE/BRANCH/QUOTA/XXXX
  // Normally we'd look up Institution from Department -> Campus -> Institution
  // For simplicity, hardcoding INST or fetching first Institution
  const institution = await Institution.findOne();
  const instName = institution ? institution.name.substring(0, 4).toUpperCase() : 'INST';
  
  const year = program.academicYear.split('-')[0] || new Date().getFullYear();
  const course = program.courseType.toUpperCase();
  const branch = program.name.substring(0, 4).toUpperCase();
  
  const prefix = `${instName}/${year}/${course}/${branch}/${quotaType.toUpperCase()}`;
  
  // Atomic counter
  const counter = await Counter.findByIdAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create if doesn't exist
  );
  
  const seqStr = counter.seq.toString().padStart(4, '0');
  return `${prefix}/${seqStr}`;
};

// Seat Allocation API
exports.allocateSeat = async (req, res) => {
  try {
    const { applicantId, programId, quotaType } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    if (applicant.documentsStatus !== 'Verified') {
        const errorMsg = 'Applicant documents must be verified before allocation';
        return res.status(400).json({ error: errorMsg });
    }

    // Pre-check for existing admission
    const existingAdmission = await Admission.findOne({ applicantId });
    if (existingAdmission) {
      return res.status(400).json({ error: 'Applicant already has an admission allocated.' });
    }

    // Attempt ATOMIC Update of Quota
    // Race Condition Prevention: findOneAndUpdate with condition filledSeats < totalSeats
    const quota = await Quota.findOneAndUpdate(
      { 
        programId: programId, 
        type: quotaType,
        $expr: { $lt: ["$filledSeats", "$totalSeats"] } // Atomic check
      },
      { $inc: { filledSeats: 1 } },
      { new: true }
    );

    if (!quota) {
      return res.status(400).json({ error: 'Quota full or not found. Cannot allocate seat.' });
    }

    // Quota incremented atomically, safe to create Admission record
    const admission = new Admission({
      applicantId,
      programId,
      quotaType,
      status: 'Allocated'
    });

    await admission.save();
    res.status(201).json(admission);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admission Confirmation API
exports.confirmAdmission = async (req, res) => {
  try {
    const { id } = req.params; // Admission ID
    const { feeStatus } = req.body;

    if (feeStatus !== 'Paid') {
      return res.status(400).json({ error: 'Fee status must be Paid to confirm admission' });
    }

    const admission = await Admission.findById(id);
    if (!admission) return res.status(404).json({ error: 'Admission not found' });
    
    if (admission.status === 'Confirmed') {
        return res.status(400).json({ error: 'Admission already confirmed' });
    }

    // Generate strict Unique Array
    const admissionNumber = await generateAdmissionNumber(admission.programId, admission.quotaType);

    admission.feeStatus = 'Paid';
    admission.status = 'Confirmed';
    admission.admissionNumber = admissionNumber;
    
    await admission.save();

    res.json(admission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllAdmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const query = Admission.find()
      .populate('applicantId', 'name email phone marks documentsStatus')
      .populate('programId', 'name courseType')
      .sort({ createdAt: -1 });

    if (limit) {
      const skip = (page - 1) * limit;
      const total = await Admission.countDocuments();
      const admissions = await query.skip(skip).limit(limit).exec();
      return res.json({ admissions, total, totalPages: Math.ceil(total / limit), currentPage: page });
    } else {
      const admissions = await query.exec();
      return res.json(admissions);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
