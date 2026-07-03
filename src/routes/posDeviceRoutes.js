import express from 'express';
import { PosDeviceController } from '../controllers/posDeviceController.js';

import { authenticateApiKey } from '../middlewares/auth.js';

const router = express.Router();

// Endpoint getdevice di bawah perlindungan M2M signature authentication
router.get('/getdevice', authenticateApiKey, PosDeviceController.getDevice);

export default router;
