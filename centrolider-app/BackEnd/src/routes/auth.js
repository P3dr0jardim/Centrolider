const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty(),
], authController.login);

router.get('/me', auth, authController.me);

module.exports = router;
