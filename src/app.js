import express from 'express';
import dotenv from 'dotenv';
import { db } from './config/db.js';

import { authenticateApiKey } from './middlewares/auth.js';
import posDeviceRoutes from './routes/posDeviceRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Jalankan simple query untuk memverifikasi koneksi database
    await db.one('SELECT 1 AS ok');
    res.json({
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'DISCONNECTED',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Protected Demo Route
app.post('/api/pos/sync', authenticateApiKey, (req, res) => {
  res.json({
    message: 'Sync data POS berhasil',
    device: {
      id: req.device.posdevice_id,
      name: req.device.name
    },
    siteCode: req.siteCode,
    deptCode: req.deptCode,
    timestamp: new Date()
  });
});

// POS Device Routes
app.use('/api/pos', posDeviceRoutes);

// Customer Routes
app.use('/api/customers', customerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JFXPOS API',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
