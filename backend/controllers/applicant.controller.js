const Applicant = require('../models/Applicant');

exports.createApplicant = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    const existingEmail = await Applicant.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingEmail) return res.status(400).json({ error: 'An applicant with this email address is already registered.' });
    
    const existingPhone = await Applicant.findOne({ phone });
    if (existingPhone) return res.status(400).json({ error: 'An applicant with this phone number is already registered.' });

    const applicant = new Applicant(req.body);
    await applicant.save();
    res.status(201).json(applicant);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ error: `An applicant with this ${field} already exists.` });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.updateApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Applicant.findById(id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    
    // Security measure: delete email and phone from payload so they cannot be modified during edit
    delete req.body.email;
    delete req.body.phone;

    Object.assign(applicant, req.body);
    await applicant.save();
    res.json(applicant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllApplicants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    
    if (limit) {
      const skip = (page - 1) * limit;
      const total = await Applicant.countDocuments();
      const applicants = await Applicant.find().skip(skip).limit(limit).sort({ createdAt: -1 });
      return res.json({ applicants, total, totalPages: Math.ceil(total / limit), currentPage: page });
    } else {
      const applicants = await Applicant.find().sort({ createdAt: -1 });
      return res.json(applicants);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentsStatus } = req.body;
    
    if (!['Pending', 'Submitted', 'Verified'].includes(documentsStatus)) {
      return res.status(400).json({ error: 'Invalid document status' });
    }

    const applicant = await Applicant.findById(id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });

    if (applicant.documentsStatus === 'Verified') {
      return res.status(400).json({ error: 'Applicant documents are already verified and cannot be altered.' });
    }

    applicant.documentsStatus = documentsStatus;
    await applicant.save();

    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    
    res.json(applicant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
