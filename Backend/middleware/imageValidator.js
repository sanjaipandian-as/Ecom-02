import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import { unlink } from 'fs/promises';

// Disable sharp caching to prevent file locking issues on Windows
sharp.cache(false);

/**
 * Image & Video Validator Middleware
 *
 * Runs AFTER Multer has written files to tmp/, BEFORE the controller processes them.
 * Performs critical security and integrity checks.
 *
 * Magic Byte Verification:
 *   Verifies the true file type via magic bytes to prevent spoofing.
 *
 * Dimension Validation (Images only):
 *   Rejects images that are too large (memory bomb risk) or too small.
 *
 * On failure: Cleans up ALL tmp files from the request before rejecting.
 */

const ALLOWED_MAGIC_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/x-m4v',
  'video/mpeg',
  'video/3gpp',
  'video/3gpp2',
  'video/x-flv',
  'video/x-ms-wmv',
];

// Dimension bounds for images
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
 * Express middleware: validate image/video uploads after Multer processing.
 */
export const validateImages = async (req, res, next) => {
  const files = getUploadedFiles(req);

  // No files to validate — pass through
  if (files.length === 0) return next();

  try {
    for (const file of files) {
      // ─── Layer 3: Magic Byte Verification ───
      const fileType = await fileTypeFromFile(file.path);

      if (!fileType || !ALLOWED_MAGIC_TYPES.includes(fileType.mime)) {
        await cleanupTmpFiles(files);
        return res.status(400).json({
          message: `File "${file.originalname}" failed security validation. ` +
                   `Detected type: ${fileType?.mime || 'unknown'}. ` +
                   `Only JPEG, PNG, WebP, GIF, and videos (MP4, WebM, OGG, Quicktime, AVI, MKV) are allowed.`
        });
      }

      // If it's a video file, skip the dimension validation since sharp cannot parse videos
      if (fileType.mime.startsWith('video/')) {
        continue;
      }

      // ─── Layer 4: Dimension Validation (Images only) ───
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

    // All files passed validation
    next();
  } catch (err) {
    // Unexpected error during validation — clean up and forward
    await cleanupTmpFiles(files);
    console.error('[ImageValidator] Validation error:', err);
    return res.status(500).json({
      message: 'Image/video validation failed due to a server error.',
    });
  }
};
