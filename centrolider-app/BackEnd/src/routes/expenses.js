const router = require('express').Router();
const expensesController = require('../controllers/expensesController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', expensesController.getAll);
router.get('/:id', expensesController.getOne);
router.post('/', expensesController.create);
router.put('/:id', expensesController.update);
router.delete('/:id', expensesController.remove);

module.exports = router;
