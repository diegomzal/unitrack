const express = require('express');
const router = express.Router();
const universitiesController = require('../controllers/universitiesController');

router.get('/', universitiesController.getAll);
router.get('/:id', universitiesController.getById);
router.post('/', universitiesController.create);
router.put('/:id', universitiesController.update);
router.delete('/:id', universitiesController.delete);

module.exports = router;
