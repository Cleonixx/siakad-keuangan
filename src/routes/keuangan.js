const express = require('express');
const router = express.Router();
const {
  getAllKeuangan,
  getKeuanganByNim,
  updateUKT,
  bayarUKT,
  getRiwayatPembayaran
} = require('../controllers/keuanganController');

// GET semua data keuangan
router.get('/', getAllKeuangan);

// GET keuangan by NIM
router.get('/:nim', getKeuanganByNim);

// PUT update UKT mahasiswa
router.put('/:nim/ukt', updateUKT);

// POST bayar UKT
router.post('/:nim/bayar', bayarUKT);

// GET riwayat pembayaran by NIM
router.get('/:nim/riwayat', getRiwayatPembayaran);

module.exports = router;