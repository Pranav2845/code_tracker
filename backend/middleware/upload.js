// backend/middleware/upload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Always resolve to "<project-root>/uploads"
const uploadDir = path.resolve(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `photo-${unique}${ext}`);
  },
});

// Optional hardening (uncomment if you want limits/filters)
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (_req, file, cb) => {
//     file.mimetype?.startsWith('image/')
//       ? cb(null, true)
//       : cb(new Error('Only image uploads are allowed'));
//   },
// });

const upload = multer({ storage });

export default upload;
