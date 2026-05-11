const router = require('express').Router();
const schedulesController = require('../controllers/schedulesController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', schedulesController.getAll);
router.get('/:id', schedulesController.getOne);
router.post('/', schedulesController.create);
router.put('/:id', schedulesController.update);
router.delete('/:id', schedulesController.remove);

module.exports = router;
