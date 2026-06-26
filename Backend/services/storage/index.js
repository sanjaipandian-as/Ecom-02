import { LocalStorageDriver } from './LocalStorageDriver.js';
// Future drivers:
// import { S3StorageDriver } from './S3StorageDriver.js';
// import { CloudinaryStorageDriver } from './CloudinaryStorageDriver.js';

/**
 * Factory: Creates the appropriate storage driver based on configuration.
 *
 * Reads STORAGE_DRIVER env var to determine which implementation to use.
 * When migrating to cloud storage, you only need to:
 *   1. Implement the new driver class (extends StorageService)
 *   2. Add a case here
 *   3. Set STORAGE_DRIVER=s3 (or cloudinary, r2) in .env
 *
 * Zero changes to controllers, models, or routes.
 *
 * @returns {import('./StorageService.js').StorageService}
 */
function createStorageService() {
  const driver = process.env.STORAGE_DRIVER || 'local';

  switch (driver) {
    case 'local':
      return new LocalStorageDriver({
        uploadsRoot: process.env.UPLOADS_ROOT || './uploads',
        baseUrl: process.env.UPLOADS_BASE_URL || 'http://localhost:8000/uploads',
      });

    // case 's3':
    //   return new S3StorageDriver({
    //     bucket: process.env.S3_BUCKET,
    //     region: process.env.S3_REGION,
    //     accessKeyId: process.env.S3_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    //     cdnBaseUrl: process.env.S3_CDN_BASE_URL,
    //   });

    // case 'r2':
    //   return new S3StorageDriver({  // R2 is S3-compatible
    //     bucket: process.env.R2_BUCKET,
    //     region: 'auto',
    //     endpoint: process.env.R2_ENDPOINT,
    //     accessKeyId: process.env.R2_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    //     cdnBaseUrl: process.env.R2_CDN_BASE_URL,
    //   });

    // case 'cloudinary':
    //   return new CloudinaryStorageDriver({
    //     cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    //     apiKey: process.env.CLOUDINARY_API_KEY,
    //     apiSecret: process.env.CLOUDINARY_API_SECRET,
    //   });

    default:
      throw new Error(
        `[StorageService] Unknown STORAGE_DRIVER: "${driver}". ` +
        `Valid options: local, s3, r2, cloudinary`
      );
  }
}

/**
 * Lazy singleton storage service instance.
 *
 * Uses a getter proxy so the actual StorageService is only created on
 * first method call — AFTER dotenv.config() has run in server.js.
 *
 * ESM modules resolve all imports before any module-body code executes,
 * so `export const storage = createStorageService()` would crash because
 * process.env.UPLOADS_BASE_URL is undefined at import-time.
 *
 * Import in controllers:  import { storage } from '../services/storage/index.js';
 */
let _instance = null;

export const storage = new Proxy({}, {
  get(target, prop) {
    if (!_instance) {
      _instance = createStorageService();
    }
    const value = _instance[prop];
    // Bind methods so `this` refers to the real driver instance
    return typeof value === 'function' ? value.bind(_instance) : value;
  }
});
