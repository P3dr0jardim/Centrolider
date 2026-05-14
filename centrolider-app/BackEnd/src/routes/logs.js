const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/logsController');

router.get('/', auth, ctrl.getAll);

module.exports = router;
