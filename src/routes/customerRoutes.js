import express from 'express';
import { CustomerController } from '../controllers/customerController.js';
import { authenticateApiKey } from '../middlewares/auth.js';

const router = express.Router();

// Semua API customer terproteksi dengan M2M Signature & API-Key verification
router.get('/', authenticateApiKey, CustomerController.getAllCustomers);
router.get('/search', authenticateApiKey, CustomerController.searchCustomers);
router.get('/:id', authenticateApiKey, CustomerController.getCustomerById);

export default router;
