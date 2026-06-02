const express = require('express');
const router = express.Router();
const {
  sinkronisasiMahasiswa,
  statusSinkronisasi
} = require('../controllers/sinkronisasiController');

// POST jalankan sinkronisasi manual
router.post('/jalankan', sinkronisasiMahasiswa);

// GET status sinkronisasi terakhir
router.get('/status', statusSinkronisasi);

module.exports = router;