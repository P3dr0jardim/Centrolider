const router = require('express').Router();
const fleetsController = require('../controllers/fleetsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', fleetsController.getAll);
router.get('/:id', fleetsController.getOne);
router.post('/', fleetsController.create);
router.put('/:id', fleetsController.update);
router.delete('/:id', fleetsController.remove);

module.exports = router;
