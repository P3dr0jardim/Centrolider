const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const vehiclesController = require('../controllers/vehiclesController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/i;
    const ok = allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Tipo de ficheiro não permitido'));
  },
});

router.use(auth);

router.get('/', vehiclesController.getAll);
router.get('/:id', vehiclesController.getOne);
router.post('/', vehiclesController.create);
router.put('/:id', vehiclesController.update);
router.delete('/:id', vehiclesController.remove);
router.post('/:id/maintenance', vehiclesController.addMaintenanceRecord);
router.put('/:id/maintenance/:recordId', vehiclesController.updateMaintenanceRecord);
router.delete('/:id/maintenance/:recordId', vehiclesController.deleteMaintenanceRecord);
router.post('/:id/attachments', upload.single('file'), vehiclesController.addAttachment);
router.put('/:id/attachments/:attachmentId/meta', vehiclesController.editAttachment);
router.patch('/:id/attachments/:attachmentId/archive', vehiclesController.toggleArchiveAttachment);
router.get('/:id/attachments/:attachmentId', vehiclesController.downloadAttachment);

module.exports = router;
