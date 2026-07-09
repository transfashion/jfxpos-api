import express from 'express';
import { PosSyncController } from '../controllers/posSyncController.js';
import { authenticateApiKey } from '../middlewares/auth.js';

const router = express.Router();

// Route untuk persiapan sinkronisasi item, terproteksi dengan M2M Signature & API-Key verification
router.post('/prepareItemSyn', authenticateApiKey, PosSyncController.prepareItemSync);
router.get('/getItemSync', authenticateApiKey, PosSyncController.getItemSync);
router.post('/finishItemSync', authenticateApiKey, PosSyncController.finishItemSync);

// Route untuk persiapan sinkronisasi salesperson, terproteksi dengan M2M Signature & API-Key verification
router.post('/prepareSalespersonSyn', authenticateApiKey, PosSyncController.prepareSalespersonSync);
router.get('/getSalespersonSync', authenticateApiKey, PosSyncController.getSalespersonSync);
router.post('/finishSalespersonSync', authenticateApiKey, PosSyncController.finishSalespersonSync);


export default router;
