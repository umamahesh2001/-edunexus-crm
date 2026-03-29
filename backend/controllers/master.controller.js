const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Department = require('../models/Department');
const Program = require('../models/Program');
const Quota = require('../models/Quota');

// Get all structure data
exports.getAllMasterData = async (req, res) => {
  try {
    const institutions = await Institution.find();
    const campuses = await Campus.find().populate('institutionId', 'name');
    const departments = await Department.find().populate('campusId', 'name');
    const programs = await Program.find().populate('departmentId', 'name');
    const quotas = await Quota.find().populate('programId', 'name');

    res.json({ institutions, campuses, departments, programs, quotas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaginatedMasterData = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let Model, populate = '', searchFilter = {};
    switch (type) {
      case 'institutions': Model = Institution; if (search) searchFilter.name = new RegExp(search, 'i'); break;
      case 'campuses':     Model = Campus;      populate = 'institutionId'; if (search) searchFilter.name = new RegExp(search, 'i'); break;
      case 'departments':  Model = Department;  populate = 'campusId';      if (search) searchFilter.name = new RegExp(search, 'i'); break;
      case 'programs':     Model = Program;     populate = 'departmentId';  if (search) searchFilter.name = new RegExp(search, 'i'); break;
      case 'quotas':       Model = Quota;       populate = 'programId';     if (search) searchFilter.type = new RegExp(search, 'i'); break;
      default: return res.status(400).json({ error: 'Invalid config type' });
    }

    const total = await Model.countDocuments(searchFilter);
    let q = Model.find(searchFilter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (populate) q = q.populate(populate, 'name');
    const data = await q;

    res.json({ data, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.createInstitution = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Name is required' });
    const existing = await Institution.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } });
    if (existing) return res.status(400).json({ error: `Institution '${req.body.name}' already exists.` });

    const institution = new Institution(req.body);
    await institution.save();
    res.status(201).json(institution);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: `Institution '${req.body.name}' already exists.` });
    res.status(400).json({ error: err.message });
  }
};

exports.createCampus = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Name is required' });
    const existing = await Campus.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, 
      institutionId: req.body.institutionId 
    });
    if (existing) return res.status(400).json({ error: `Campus '${req.body.name}' already exists under this Institution.` });

    const campus = new Campus(req.body);
    await campus.save();
    res.status(201).json(campus);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Name is required' });
    const existing = await Department.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, 
      campusId: req.body.campusId 
    });
    if (existing) return res.status(400).json({ error: `Department '${req.body.name}' already exists in this Campus.` });

    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createProgram = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Name is required' });
    const existing = await Program.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, 
      departmentId: req.body.departmentId 
    });
    if (existing) return res.status(400).json({ error: `Program '${req.body.name}' already exists in this Department.` });

    const program = new Program(req.body);
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create quotas and validate against total intake
exports.createQuotas = async (req, res) => {
  try {
    const { programId, quotas } = req.body; // quotas is an array of objects
    
    const program = await Program.findById(programId);
    if (!program) return res.status(404).json({ error: 'Program not found' });

    const existingQuotas = await Quota.find({ programId, isActive: true });
    if (existingQuotas.length > 0) {
      return res.status(400).json({ error: 'Quotas have already been allocated for this Program. You must deprecate existing quotas to define a new matrix.' });
    }

    let totalRequestedSeats = quotas.reduce((sum, q) => sum + q.totalSeats, 0);

    if (totalRequestedSeats > program.totalIntake) {
      return res.status(400).json({ 
        error: `Requested seats (${totalRequestedSeats}) exceed the Program's total intake capacity (${program.totalIntake}).` 
      });
    }

    const createdQuotas = [];
    for (let q of quotas) {
      q.programId = programId;
      const newQuota = new Quota(q);
      await newQuota.save();
      createdQuotas.push(newQuota);
    }

    res.status(201).json(createdQuotas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const models = { institutions: Institution, campuses: Campus, departments: Department, programs: Program, quotas: Quota };

exports.updateMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    if (!Model) return res.status(400).json({ error: 'Invalid config type' });
    
    // Validate Duplicate name on update
    if (req.body.name && type !== 'quotas') {
      let query = { name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, _id: { $ne: id } };
      if (type === 'campuses' && req.body.institutionId) query.institutionId = req.body.institutionId;
      if (type === 'departments' && req.body.campusId) query.campusId = req.body.campusId;
      if (type === 'programs' && req.body.departmentId) query.departmentId = req.body.departmentId;

      const existing = await Model.findOne(query);
      if (existing) return res.status(400).json({ error: `A record named '${req.body.name}' already exists in this configuration level.` });
    }

    if (type === 'quotas' && req.body.totalSeats !== undefined) {
      const quota = await Quota.findById(id);
      if (req.body.totalSeats < quota.filledSeats) {
         return res.status(400).json({ error: 'Cannot reduce total seats below currently filled seats.'});
      }
    }
    
    if (type === 'programs' && req.body.totalIntake !== undefined) {
       const existingQuotas = await Quota.find({ programId: id });
       const existingSeats = existingQuotas.reduce((sum, q) => sum + q.totalSeats, 0);
       if (req.body.totalIntake < existingSeats) {
         return res.status(400).json({ error: 'Cannot reduce program total intake below configured quotas.' });
       }
    }

    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch(err) { 
    if (err.code === 11000) return res.status(400).json({ error: `A record with this name already exists.` });
    res.status(400).json({error: err.message}); 
  }
};

exports.deleteMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    if (!Model) return res.status(400).json({ error: 'Invalid config type' });

    if (type === 'institutions') {
      const count = await Campus.countDocuments({ institutionId: id });
      if (count > 0) return res.status(400).json({ error: 'Cannot delete: Institution is used by Campuses. Deprecate it instead.' });
    }
    if (type === 'campuses') {
      const count = await Department.countDocuments({ campusId: id });
      if (count > 0) return res.status(400).json({ error: 'Cannot delete: Campus is used by Departments. Deprecate it instead.' });
    }
    if (type === 'departments') {
      const count = await Program.countDocuments({ departmentId: id });
      if (count > 0) return res.status(400).json({ error: 'Cannot delete: Department is used by Programs. Deprecate it instead.' });
    }
    if (type === 'programs') {
      const qCount = await Quota.countDocuments({ programId: id });
      const Admission = require('../models/Admission');
      const aCount = await Admission.countDocuments({ programId: id });
      if (qCount > 0 || aCount > 0) return res.status(400).json({ error: 'Cannot delete: Program has configured Quotas or Admissions. Deprecate it instead.' });
    }
    if (type === 'quotas') {
      const quota = await Quota.findById(id);
      if (quota && quota.filledSeats > 0) return res.status(400).json({ error: 'Cannot delete: Quota has filled seats. Deprecate it instead.' });
    }

    await Model.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    if (!Model) return res.status(400).json({ error: 'Invalid config type' });
    
    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    
    doc.isActive = !doc.isActive;
    await doc.save();
    res.json(doc);
  } catch (err) { res.status(400).json({ error: err.message }); }
};
