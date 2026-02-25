const express = require('express');
const router = express.Router();
const sharesController = require('../controllers/sharesController');

router.get('/', sharesController.getMyShares);
router.get('/with-me', sharesController.getSharedWithMe);
router.get('/invitations', sharesController.getInvitations);
router.post('/', sharesController.createShare);
router.put('/:id', sharesController.updateShare);
router.put('/:id/respond', sharesController.respondToShare);
router.delete('/:id', sharesController.deleteShare);
router.get('/:id/applications', sharesController.getSharedApplications);

module.exports = router;
