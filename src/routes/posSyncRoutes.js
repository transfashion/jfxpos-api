import express from 'express';
import { PosSyncController } from '../controllers/posSyncController.js';
import { authenticateApiKey } from '../middlewares/auth.js';

const router = express.Router();

// Route untuk persiapan sinkronisasi item, terproteksi dengan M2M Signature & API-Key verification
router.post('/prepareItemSyn', authenticateApiKey, PosSyncController.prepareItemSync);
router.get('/getItemSync', authenticateApiKey, PosSyncController.getItemSync);
router.post('/finishItemSync', authenticateApiKey, PosSyncController.finishItemSync);


export default router;
