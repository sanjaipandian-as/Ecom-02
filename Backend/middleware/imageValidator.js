import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import { unlink } from 'fs/promises';

// Disable sharp caching to prevent file locking issues on Windows
sharp.cache(false);

/**
 * Image Validator Middleware
 *
 * Runs AFTER Multer has written files to tmp/, BEFORE the controller processes them.
 * Performs two critical security checks that Multer's fileFilter cannot do:
 *
 *   Layer 3 — Magic Byte Verification:
 *     The Content-Type header can be spoofed. This reads the actual file bytes
 *     to verify the true file type. Catches renamed .exe → .jpg attacks.
 *
 *   Layer 4 — Dimension Validation:
 *     Rejects images that are too large (memory bomb risk) or too small
 *     (likely not a real product image).
 *
 * On failure: Cleans up ALL tmp files from the request before rejecting.
 *
 * Usage in routes:
 *   router.post('/', upload.array('images', 5), validateImages, createProduct);
 *   router.post('/', upload.single('image'), validateImages, createHeroSlide);
 */

const ALLOWED_MAGIC_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Dimension bounds
const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;
const MAX_WIDTH = 8192;
const MAX_HEIGHT = 8192;

/**
 * Clean up all uploaded tmp files from a request.
 * Called on validation failure to prevent orphaned tmp files.
 */
async function cleanupTmpFiles(files) {
  if (!files || files.length === 0) return;
  for (const file of files) {
    try {
      await unlink(file.path);
    } catch (err) {
      // File might already be gone — not critical
      if (err.code !== 'ENOENT') {
        console.warn(`[ImageValidator] Failed to clean tmp file: ${file.path}`, err.message);
      }
    }
  }
}

/**
 * Normalize Multer's file(s) into a consistent array.
 * Handles both .single() (req.file) and .array() (req.files).
 */
function getUploadedFiles(req) {
  if (req.files && req.files.length > 0) return req.files;
  if (req.file) return [req.file];
  return [];
}

/**
 * Express middleware: validate image uploads after Multer processing.
 */
export const validateImages = async (req, res, next) => {
  const files = getUploadedFiles(req);

  // No files to validate — pass through (image might come from URL in body)
  if (files.length === 0) return next();

  try {
    for (const file of files) {
      // ─── Layer 3: Magic Byte Verification ───
      const fileType = await fileTypeFromFile(file.path);
      const isImage = fileType && fileType.mime.startsWith('image/');

      if (isImage) {
        if (!ALLOWED_MAGIC_TYPES.includes(fileType.mime)) {
          await cleanupTmpFiles(files);
          return res.status(400).json({
            message: `File "${file.originalname}" failed security validation. ` +
                     `Detected type: ${fileType?.mime || 'unknown'}. ` +
                     `Only JPEG, PNG, WebP, and GIF are allowed.`
          });
        }

        // ─── Layer 4: Dimension Validation ───
        const metadata = await sharp(file.path).metadata();

        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          await cleanupTmpFiles(files);
          return res.status(400).json({
            message: `File "${file.originalname}" is too large: ${metadata.width}×${metadata.height}px. ` +
                     `Maximum allowed: ${MAX_WIDTH}×${MAX_HEIGHT}px.`
          });
        }

        if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
          await cleanupTmpFiles(files);
          return res.status(400).json({
            message: `File "${file.originalname}" is too small: ${metadata.width}×${metadata.height}px. ` +
                     `Minimum required: ${MIN_WIDTH}×${MIN_HEIGHT}px.`
          });
        }
      }
    }

    // All files passed validation
    next();
  } catch (err) {
    // Unexpected error during validation — clean up and forward
    await cleanupTmpFiles(files);
    console.error('[ImageValidator] Validation error:', err);
    return res.status(500).json({
      message: 'Image validation failed due to a server error.',
    });
  }
};
