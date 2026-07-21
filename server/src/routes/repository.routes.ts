import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { repositoryController } from '../controllers/repository.controller.js';
import { ragController } from '../controllers/rag.controller.js';
import { codeUnderstandingController } from '../controllers/codeUnderstanding.controller.js';
import { architectureController } from '../controllers/architecture.controller.js';
import { authenticate } from '../middleware/auth.js';
import { embedLimiter, queryLimiter } from '../middleware/rateLimiter.js';

const uploadDir = path.resolve('data/uploads');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

const router = Router();

router.use(authenticate);

router.post('/import/url', repositoryController.importByUrl);
router.post('/import/zip', upload.single('file'), repositoryController.importByZip);
router.get('/', repositoryController.list);
router.post('/:id/parse', repositoryController.parse);
router.post('/:id/embed', embedLimiter, ragController.embed);
router.post('/:id/query', queryLimiter, ragController.query);
router.post('/:id/explain', codeUnderstandingController.explain);
router.get('/:id/files', codeUnderstandingController.getFileTree);
router.get('/:id/file-info', codeUnderstandingController.getFileInfo);
router.get('/:id/architecture/folders', architectureController.getFolderStructure);
router.get('/:id/architecture/dependencies', architectureController.getDependencyGraph);
router.get('/:id/architecture/api-flow', architectureController.getApiFlow);
router.get('/:id/architecture/db-schema', architectureController.getDbSchema);
router.get('/:id', repositoryController.getById);
router.delete('/:id', repositoryController.delete);

export default router;