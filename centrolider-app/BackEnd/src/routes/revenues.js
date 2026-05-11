const router = require('express').Router();
const revenuesController = require('../controllers/revenuesController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', revenuesController.getAll);
router.get('/:id', revenuesController.getOne);
router.post('/', revenuesController.create);
router.put('/:id', revenuesController.update);
router.delete('/:id', revenuesController.remove);

module.exports = router;
