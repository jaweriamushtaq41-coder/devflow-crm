const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const env = require('../config/env');

// Vercel mein sirf /tmp folder writable hota hai
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '..', env.upload.dir);
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  // ignore
}

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Never trust the original filename — generate a safe unique name.
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.upload.maxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'), false);
    }
    cb(null, true);
  },
});

module.exports = { upload };
