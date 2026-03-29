require('dotenv').config();
const mongoose = require('mongoose');
const Institution = require('./models/Institution');
const Campus = require('./models/Campus');
const Department = require('./models/Department');
const Program = require('./models/Program');
const Quota = require('./models/Quota');
const Applicant = require('./models/Applicant');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/admission-crm';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Wipe existing data (Be careful in production)
    await Institution.deleteMany();
    await Campus.deleteMany();
    await Department.deleteMany();
    await Program.deleteMany();
    await Quota.deleteMany();
    await Applicant.deleteMany();

    // 1. Institution
    const inst = await Institution.create({ name: 'Global Institute of Technology' });

    // 2. Campus
    const campus = await Campus.create({ name: 'Main Campus', institutionId: inst._id });

    // 3. Department
    const cseDept = await Department.create({ name: 'Computer Science', campusId: campus._id });

    // 4. Program
    const btechProgram = await Program.create({
      name: 'B.Tech CSE',
      departmentId: cseDept._id,
      courseType: 'UG',
      entryType: 'Regular',
      academicYear: '2026-2027',
      totalIntake: 60
    });

    // 5. Quotas (Total 60)
    await Quota.create([
      { programId: btechProgram._id, type: 'KCET', totalSeats: 27 },
      { programId: btechProgram._id, type: 'COMEDK', totalSeats: 18 },
      { programId: btechProgram._id, type: 'Management', totalSeats: 15 }
    ]);

    // 6. Test Applicants
    await Applicant.create([
      { name: 'Alice Smith', email: 'alice@example.com', phone: '9876543210', category: 'GM', entryType: 'Regular', quotaType: 'KCET', marks: 95, documentsStatus: 'Verified' },
      { name: 'Bob Johnson', email: 'bob@example.com', phone: '9876543211', category: 'OBC', entryType: 'Regular', quotaType: 'COMEDK', marks: 88, documentsStatus: 'Submitted' }
    ]);

    console.log('Seed data successfully inserted!');
    process.exit();
  } catch (error) {
    console.error('Error with seed data', error);
    process.exit(1);
  }
};

seedData();
