const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/me', usersController.ensureProfile);
router.get('/search', usersController.searchByEmail);

module.exports = router;
