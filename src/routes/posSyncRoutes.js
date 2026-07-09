import express from 'express';
import { ItemSyncController } from '../controllers/itemSyncController.js';
import { SalespersonSyncController } from '../controllers/salespersonSyncController.js';
import { authenticateApiKey } from '../middlewares/auth.js';

const router = express.Router();

// Route untuk persiapan sinkronisasi item, terproteksi dengan M2M Signature & API-Key verification
router.post('/prepareItemSyn', authenticateApiKey, ItemSyncController.prepareItemSync);
router.get('/getItemSync', authenticateApiKey, ItemSyncController.getItemSync);
router.post('/finishItemSync', authenticateApiKey, ItemSyncController.finishItemSync);

// Route untuk persiapan sinkronisasi salesperson, terproteksi dengan M2M Signature & API-Key verification
router.post('/prepareSalespersonSyn', authenticateApiKey, SalespersonSyncController.prepareSalespersonSync);
router.get('/getSalespersonSync', authenticateApiKey, SalespersonSyncController.getSalespersonSync);
router.post('/finishSalespersonSync', authenticateApiKey, SalespersonSyncController.finishSalespersonSync);

export default router;
