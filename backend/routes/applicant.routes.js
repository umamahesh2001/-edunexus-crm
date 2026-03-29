const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant.controller');

router.post('/', applicantController.createApplicant);
router.get('/', applicantController.getAllApplicants);
router.put('/:id', applicantController.updateApplicant);
router.patch('/:id/documents', applicantController.updateDocumentStatus);

module.exports = router;
