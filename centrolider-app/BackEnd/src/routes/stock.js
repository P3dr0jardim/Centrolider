const router = require('express').Router();
const stockController = require('../controllers/stockController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', stockController.getAll);
router.get('/:id', stockController.getOne);
router.post('/consume', stockController.consume);
router.post('/', stockController.create);
router.put('/:id', stockController.update);
router.delete('/:id', stockController.remove);

module.exports = router;
