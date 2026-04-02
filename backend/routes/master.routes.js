const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const { protect, authorize } = require('../middleware/auth');

// All master routes require authentication
router.use(protect);

// Read access for all roles
router.get('/', masterController.getAllMasterData);
router.get('/paginated/:type', masterController.getPaginatedMasterData);

// Write access for Admin only
router.post('/institutions', authorize('Admin'), masterController.createInstitution);
router.post('/campuses', authorize('Admin'), masterController.createCampus);
router.post('/departments', authorize('Admin'), masterController.createDepartment);
router.post('/programs', authorize('Admin'), masterController.createProgram);
router.post('/quotas', authorize('Admin'), masterController.createQuotas);

router.put('/:type/:id', authorize('Admin'), masterController.updateMaster);
router.delete('/:type/:id', authorize('Admin'), masterController.deleteMaster);
router.patch('/:type/:id/toggle', authorize('Admin'), masterController.toggleMaster);

module.exports = router;
