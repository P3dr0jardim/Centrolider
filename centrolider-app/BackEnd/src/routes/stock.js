const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const stockController = require('../controllers/stockController');
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
    const allowed = /jpeg|jpg|png|gif|webp|heic|heif|pdf/i;
    const ok = allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Tipo de ficheiro não permitido'));
  },
});

// Surface multer/file-filter errors as a clear 400 instead of falling through to a generic 500.
const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Ficheiro demasiado grande (máximo 20MB)' });
    }
    return res.status(400).json({ message: err.message || 'Erro ao enviar ficheiro' });
  });
};

router.use(auth);

router.get('/', stockController.getAll);
router.get('/:id', stockController.getOne);
router.post('/consume', stockController.consume);
router.post('/', stockController.create);
router.put('/:id', stockController.update);
router.delete('/:id', stockController.remove);
router.post('/:id/attachments', uploadSingle, stockController.addAttachment);
router.get('/:id/attachments/:attachmentId', stockController.downloadAttachment);
router.delete('/:id/attachments/:attachmentId', stockController.deleteAttachment);

module.exports = router;
