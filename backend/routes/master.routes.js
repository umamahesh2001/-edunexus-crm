const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');

router.get('/', masterController.getAllMasterData);
router.get('/paginated/:type', masterController.getPaginatedMasterData);
router.post('/institutions', masterController.createInstitution);
router.post('/campuses', masterController.createCampus);
router.post('/departments', masterController.createDepartment);
router.post('/programs', masterController.createProgram);
router.post('/quotas', masterController.createQuotas);

router.put('/:type/:id', masterController.updateMaster);
router.delete('/:type/:id', masterController.deleteMaster);
router.patch('/:type/:id/toggle', masterController.toggleMaster);

module.exports = router;
