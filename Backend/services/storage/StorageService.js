/**
 * StorageService — Abstract interface for file storage.
 *
 * All storage drivers (local filesystem, S3, R2, Cloudinary) implement this
 * contract. Business logic (controllers) depend ONLY on this interface,
 * never on a concrete driver. This makes provider migration a config change.
 *
 * @abstract
 */

/**
 * @typedef {Object} StoreResult
 * @property {string} relativePath - Path stored in MongoDB (e.g. "products/2026/06/uuid.webp")
 * @property {number} sizeBytes    - Final file size after processing
 */

/**
 * @typedef {Object} StoreOptions
 * @property {number}  [maxWidth=1200] - Max width to resize to (height scales proportionally)
 * @property {number}  [quality=80]    - WebP quality (1–100)
 */

export class StorageService {
  /**
   * Process and store an uploaded file.
   *
   * The implementation is responsible for:
   * 1. Generating a collision-proof filename (UUIDv4)
   * 2. Stripping EXIF metadata
   * 3. Converting to WebP format
   * 4. Resizing within maxWidth bounds
   * 5. Writing to the appropriate category/date path
   *
   * @param {Buffer|string} fileInput  - File buffer or absolute path to the tmp file on disk
   * @param {'products'|'categories'|'hero'} category - Content category (determines subfolder)
   * @param {StoreOptions} [options]
   * @returns {Promise<StoreResult>}
   */
  async store(fileInput, category, options = {}) {
    throw new Error('StorageService.store() must be implemented by a driver');
  }

  /**
   * Delete a single file by its relative path.
   *
   * @param {string} relativePath - The relative path as stored in MongoDB
   * @returns {Promise<void>}
   */
  async delete(relativePath) {
    throw new Error('StorageService.delete() must be implemented by a driver');
  }

  /**
   * Delete multiple files by their relative paths.
   * Failures on individual files are logged but do not throw —
   * this prevents a single missing file from blocking cleanup of others.
   *
   * @param {string[]} relativePaths
   * @returns {Promise<void>}
   */
  async deleteMany(relativePaths) {
    throw new Error('StorageService.deleteMany() must be implemented by a driver');
  }

  /**
   * Convert a relative path (as stored in MongoDB) to a publicly accessible URL.
   *
   * For local storage:  "https://domain.com/uploads/" + relativePath
   * For S3:             "https://bucket.s3.region.amazonaws.com/" + relativePath
   * For Cloudinary:     "https://res.cloudinary.com/cloud/image/upload/" + relativePath
   *
   * @param {string} relativePath
   * @returns {string} Full public URL
   */
  getPublicUrl(relativePath) {
    throw new Error('StorageService.getPublicUrl() must be implemented by a driver');
  }

  /**
   * Check if a file exists at the given relative path.
   *
   * @param {string} relativePath
   * @returns {Promise<boolean>}
   */
  async exists(relativePath) {
    throw new Error('StorageService.exists() must be implemented by a driver');
  }
}
