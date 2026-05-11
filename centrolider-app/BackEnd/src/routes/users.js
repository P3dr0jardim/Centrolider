const router = require('express').Router();
const { body } = require('express-validator');
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const createValidation = [
  body('username').notEmpty().trim().isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['accounting', 'manager', 'admin']),
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
];

const updateValidation = [
  body('role').optional().isIn(['accounting', 'manager', 'admin']),
  body('password').optional().isLength({ min: 6 }),
  body('email').optional().isEmail().normalizeEmail(),
];

router.use(auth, requireAdmin);

router.get('/', usersController.getAll);
router.post('/', createValidation, usersController.create);
router.put('/:id', updateValidation, usersController.update);
router.delete('/:id', usersController.remove);

module.exports = router;
