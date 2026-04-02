const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admission.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/allocate', authorize('Admin', 'Admission Officer'), admissionController.allocateSeat);
router.post('/:id/confirm', authorize('Admin', 'Admission Officer'), admissionController.confirmAdmission);
router.get('/', admissionController.getAllAdmissions);

module.exports = router;
