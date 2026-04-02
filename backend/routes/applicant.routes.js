const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('Admin', 'Admission Officer'), applicantController.createApplicant);
router.get('/', applicantController.getAllApplicants);
router.put('/:id', authorize('Admin', 'Admission Officer'), applicantController.updateApplicant);
router.patch('/:id/documents', authorize('Admin', 'Admission Officer'), applicantController.updateDocumentStatus);

module.exports = router;
