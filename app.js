const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./src/config/database');
const keuanganRoutes = require('./src/routes/keuangan');
const sinkronisasiRoutes = require('./src/routes/sinkronisasi');
const syncScheduler = require('./src/scheduler/syncScheduler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/sinkronisasi', sinkronisasiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Keuangan SIAKAD is Running',
    version: '1.0.0',
    endpoints: {
      keuangan: '/api/keuangan',
      sinkronisasi: '/api/sinkronisasi',
    }
  });
});

// Inisialisasi database lalu jalankan server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    console.log(`📦 Database siap digunakan`);
    syncScheduler.start();
    console.log(`🔄 Scheduler sinkronisasi aktif`);
  });
}).catch((err) => {
  console.error('❌ Gagal inisialisasi database:', err);
});