import multer from "multer";
import path from "path";

/**
 * Upload Middleware — Multer configured for local filesystem staging.
 *
 * Strategy: All uploads land in the `tmp/` directory under the uploads root.
 * They are NOT in their final location yet — the storage service moves them
 * to the correct category/date path after validation and processing.
 *
 * Pipeline:  Client → Nginx (size gate) → Multer (this file) → imageValidator → StorageService.store()
 */



// Allowed MIME types (first-pass filter based on Content-Type header)
// Magic byte verification happens later in imageValidator middleware
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsRoot = path.resolve(process.env.UPLOADS_ROOT || './uploads');
    const tmpDir = path.resolve(uploadsRoot, 'tmp');
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    // Temporary filename — will be replaced by UUID in StorageService.store()
    // Using timestamp + random suffix to avoid tmp/ collisions
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.tmp';
    cb(null, `tmp-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF images are allowed.`
    );
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5,                   // Max 5 files per request
  },
});

export default upload;
