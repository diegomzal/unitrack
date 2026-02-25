const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');

router.get('/', applicationsController.getAll);
router.get('/:id', applicationsController.getById);
router.post('/', applicationsController.create);
router.put('/:id', applicationsController.update);
router.delete('/:id', applicationsController.delete);

module.exports = router;
