const express = require('express');
const router = express.Router();
const sharesController = require('../controllers/sharesController');

router.get('/', sharesController.getMyShares);
router.get('/with-me', sharesController.getSharedWithMe);
router.post('/', sharesController.createShare);
router.put('/:id', sharesController.updateShare);
router.delete('/:id', sharesController.deleteShare);
router.get('/:id/applications', sharesController.getSharedApplications);

module.exports = router;
