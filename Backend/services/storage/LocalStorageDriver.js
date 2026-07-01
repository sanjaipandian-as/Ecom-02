import { randomUUID } from 'crypto';
import path from 'path';
import { mkdir, unlink, stat, access, copyFile, chmod } from 'fs/promises';
import { constants } from 'fs';
import sharp from 'sharp';
import { fileTypeFromFile } from 'file-type';
import { StorageService } from './StorageService.js';

// Disable sharp caching to prevent file locking issues on Windows
sharp.cache(false);

/**
 * LocalStorageDriver — Stores files on the VPS filesystem.
 *
 * File pipeline:
 *   1. Multer writes raw upload to `{uploadsRoot}/tmp/`
 *   2. imageValidator middleware verifies magic bytes + dimensions
 *   3. This driver:  EXIF strip → auto-rotate → resize → WebP → write to final path
 *   4. Returns the relative path for MongoDB storage
 *
 * Directory layout:
 *   {uploadsRoot}/{category}/{YYYY}/{MM}/{uuid}.webp
 *
 * Example:
 *   /var/www/plenora-uploads/products/2026/06/a1b2c3d4-e5f6-7890-abcd-ef1234567890.webp
 */
export class LocalStorageDriver extends StorageService {
  /**
   * @param {Object} config
   * @param {string} config.uploadsRoot - Absolute path to uploads root (e.g. "/var/www/plenora-uploads")
   * @param {string} config.baseUrl    - Public base URL for serving uploads (e.g. "https://domain.com/uploads")
   */
  constructor({ uploadsRoot, baseUrl }) {
    super();
    this.uploadsRoot = uploadsRoot;
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // Strip trailing slashes
  }

  /**
   * Default resize dimensions per content category.
   * Hero banners need full-width, category icons are small thumbnails.
   */
  static CATEGORY_DEFAULTS = {
    products:   { maxWidth: 1200, quality: 80 },
    categories: { maxWidth: 256,  quality: 80 },
    hero:       { maxWidth: 1920, quality: 85 },
  };

  /**
   * Process and store a file on the local filesystem.
   *
   * @param {Buffer|string} fileInput  - Buffer or absolute path to the tmp file
   * @param {'products'|'categories'|'hero'} category
   * @param {import('./StorageService.js').StoreOptions} [options]
   * @returns {Promise<import('./StorageService.js').StoreResult>}
   */
  async store(fileInput, category, options = {}) {
    // 1. Resolve processing options (caller overrides > category defaults > global defaults)
    const defaults = LocalStorageDriver.CATEGORY_DEFAULTS[category] || { maxWidth: 1200, quality: 80 };
    const maxWidth = options.maxWidth ?? defaults.maxWidth;
    const quality = options.quality ?? defaults.quality;

    // 2. Generate collision-proof filename + date-partitioned directory
    const uuid = randomUUID();
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // 3. Detect if the file is a video
    let isVideo = false;
    let ext = '.webp';

    if (typeof fileInput === 'string') {
      try {
        const fileType = await fileTypeFromFile(fileInput);
        if (fileType && fileType.mime.startsWith('video/')) {
          isVideo = true;
          ext = `.${fileType.ext}`;
        }
      } catch (err) {
        console.warn(`[StorageDriver] Failed to detect file type:`, err.message);
      }
    }

    const relativePath = path.posix.join(category, year, month, `${uuid}${ext}`);
    const absolutePath = path.join(this.uploadsRoot, category, year, month, `${uuid}${ext}`);
    const absoluteDir = path.dirname(absolutePath);

    // 4. Ensure target directory exists
    await mkdir(absoluteDir, { recursive: true });

    let fileSize = 0;

    if (isVideo) {
      // Just copy the video file
      await copyFile(fileInput, absolutePath);
      try {
        await chmod(absolutePath, 0o644);
      } catch (chmodErr) {
        console.warn(`[StorageDriver] Failed to set read permissions on video:`, chmodErr.message);
      }
      const fileStats = await stat(absolutePath);
      fileSize = fileStats.size;
    } else {
      // Process image through sharp pipeline:
      const sharpInstance = sharp(fileInput);
      const outputInfo = await sharpInstance
        .rotate()
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality })
        .toFile(absolutePath);
      fileSize = outputInfo.size;
    }

    // 5. Clean up the tmp source file (if it was a path, not a buffer)
    if (typeof fileInput === 'string') {
      try {
        await unlink(fileInput);
      } catch (err) {
        // Non-critical: tmp file cleanup failure is logged but doesn't block the operation
        console.warn(`[StorageDriver] Failed to clean up tmp file: ${fileInput}`, err.message);
      }
    }

    return {
      relativePath,
      sizeBytes: fileSize,
    };
  }

  /**
   * Delete a single file from disk.
   *
   * @param {string} relativePath
   */
  async delete(relativePath) {
    if (!relativePath) return;

    // Guard: skip Cloudinary URLs or absolute URLs (legacy data)
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      console.warn(`[StorageDriver] Skipping delete for external URL: ${relativePath}`);
      return;
    }

    const absolutePath = path.join(this.uploadsRoot, relativePath);
    try {
      await unlink(absolutePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File already gone — not an error
        console.warn(`[StorageDriver] File not found (already deleted?): ${relativePath}`);
      } else {
        console.error(`[StorageDriver] Failed to delete file: ${relativePath}`, err.message);
        throw err;
      }
    }
  }

  /**
   * Delete multiple files. Errors on individual files are logged but don't throw.
   *
   * @param {string[]} relativePaths
   */
  async deleteMany(relativePaths) {
    if (!relativePaths || relativePaths.length === 0) return;

    const results = await Promise.allSettled(
      relativePaths.map(rp => this.delete(rp))
    );

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`[StorageDriver] ${failures.length}/${relativePaths.length} file deletions failed`);
    }
  }

  /**
   * Resolve a relative path to a full public URL.
   * Handles legacy Cloudinary URLs by returning them as-is.
   *
   * @param {string} relativePath
   * @returns {string}
   */
  getPublicUrl(relativePath) {
    if (!relativePath) return '';

    // Legacy support: if the path is already a full URL (Cloudinary migration),
    // return it unchanged. This enables hybrid mode during migration.
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    return `${this.baseUrl}/${relativePath}`;
  }

  /**
   * Check if a file exists on disk.
   *
   * @param {string} relativePath
   * @returns {Promise<boolean>}
   */
  async exists(relativePath) {
    if (!relativePath) return false;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return true;

    const absolutePath = path.join(this.uploadsRoot, relativePath);
    try {
      await access(absolutePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
