const Admission = require('../models/Admission');
const Quota = require('../models/Quota');
const Applicant = require('../models/Applicant');
const Program = require('../models/Program');

exports.getDashboardStats = async (req, res) => {
  try {
    // Basic KPIs
    const totalIntakeResult = await Program.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$totalIntake' } } }]);
    const totalIntake = totalIntakeResult[0]?.total || 0;

    const totalAdmittedCount = await Admission.countDocuments({ status: 'Confirmed' });
    const totalAllocatedCount = await Admission.countDocuments({ status: 'Allocated' });
    const totalApplicants = await Applicant.countDocuments();

    // Document status breakdown
    const documentStatusBreakdown = await Applicant.aggregate([
      { $group: { _id: '$documentsStatus', count: { $sum: 1 } } }
    ]);

    // Applicants by category
    const categoryBreakdown = await Applicant.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Applicants by quota type
    const quotaTypeBreakdown = await Applicant.aggregate([
      { $group: { _id: '$quotaType', count: { $sum: 1 } } }
    ]);

    // Quota seat fill stats (by quota type)
    const quotaStats = await Quota.aggregate([
      {
        $group: {
          _id: '$type',
          totalSeats: { $sum: '$totalSeats' },
          filledSeats: { $sum: '$filledSeats' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Program-wise admission fill rate (top 10)
    const programFillStats = await Quota.aggregate([
      {
        $lookup: {
          from: 'programs',
          localField: 'programId',
          foreignField: '_id',
          as: 'program'
        }
      },
      { $unwind: '$program' },
      {
        $group: {
          _id: '$program.name',
          totalSeats: { $sum: '$totalSeats' },
          filledSeats: { $sum: '$filledSeats' }
        }
      },
      { $sort: { filledSeats: -1 } },
      { $limit: 8 }
    ]);

    // Entry type breakdown
    const entryTypeBreakdown = await Applicant.aggregate([
      { $group: { _id: '$entryType', count: { $sum: 1 } } }
    ]);

    // Fee payment status breakdown
    const feeStatusBreakdown = await Admission.aggregate([
      { $group: { _id: '$feeStatus', count: { $sum: 1 } } }
    ]);

    // Fee pending list
    const feePendingList = await Admission.find({ feeStatus: 'Pending' })
      .populate('applicantId', 'name email documentsStatus')
      .populate('programId', 'name courseType')
      .limit(10);

    const pendingDocumentsCount = await Applicant.countDocuments({ documentsStatus: { $in: ['Pending', 'Submitted'] } });
    const remainingSeats = totalIntake - (totalAdmittedCount + totalAllocatedCount);

    res.json({
      totalIntake,
      totalAdmitted: totalAdmittedCount,
      totalAllocated: totalAllocatedCount,
      totalApplicants,
      remainingSeats,
      pendingDocumentsCount,
      quotaStats,
      documentStatusBreakdown,
      categoryBreakdown,
      quotaTypeBreakdown,
      programFillStats,
      entryTypeBreakdown,
      feeStatusBreakdown,
      feePendingList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
