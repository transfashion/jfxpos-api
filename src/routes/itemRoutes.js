import express from 'express';
import { ItemController } from '../controllers/itemController.js';
import { authenticateApiKey } from '../middlewares/auth.js';

const router = express.Router();

// Route untuk persiapan sinkronisasi item, terproteksi dengan M2M Signature & API-Key verification
router.post('/prepareItemSyn', authenticateApiKey, ItemController.prepareItemSync);

export default router;
