const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admission.controller');

router.post('/allocate', admissionController.allocateSeat);
router.post('/:id/confirm', admissionController.confirmAdmission);
router.get('/', admissionController.getAllAdmissions);

module.exports = router;
