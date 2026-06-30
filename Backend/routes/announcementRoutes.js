import express from 'express';
import { getActiveAnnouncement, getAdminAnnouncement, createOrUpdateAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/active', getActiveAnnouncement);
router.get('/admin', authenticate, isAdmin, getAdminAnnouncement);
router.post('/', authenticate, isAdmin, createOrUpdateAnnouncement);
router.delete('/', authenticate, isAdmin, deleteAnnouncement);

export default router;
