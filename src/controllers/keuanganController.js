const { getDatabase } = require('../config/database');

// Ambil semua data keuangan
const getAllKeuangan = (req, res) => {
  const db = getDatabase();
  db.all(`
    SELECT k.*, m.program_studi, m.status_akademik
    FROM keuangan k
    LEFT JOIN mahasiswa m ON k.nim = m.nim
    ORDER BY k.nim
  `, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, total: rows.length, data: rows });
  });
};

// Ambil data keuangan by NIM
const getKeuanganByNim = (req, res) => {
  const { nim } = req.params;
  const db = getDatabase();
  db.get(`
    SELECT k.*, m.program_studi, m.status_akademik
    FROM keuangan k
    LEFT JOIN mahasiswa m ON k.nim = m.nim
    WHERE k.nim = ?
  `, [nim], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!row) return res.status(404).json({ success: false, message: 'Data keuangan tidak ditemukan' });
    res.json({ success: true, data: row });
  });
};

// Update UKT mahasiswa
const updateUKT = (req, res) => {
  const { nim } = req.params;
  const { nilai_ukt } = req.body;
  if (!nilai_ukt) return res.status(400).json({ success: false, message: 'nilai_ukt wajib diisi' });

  const db = getDatabase();
  db.run(`
    UPDATE keuangan SET nilai_ukt = ?, updated_at = CURRENT_TIMESTAMP WHERE nim = ?
  `, [nilai_ukt, nim], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });
    res.json({ success: true, message: 'UKT berhasil diupdate' });
  });
};

// Bayar UKT
const bayarUKT = (req, res) => {
  const { nim } = req.params;
  const { jumlah_bayar, metode_pembayaran, keterangan } = req.body;
  if (!jumlah_bayar) return res.status(400).json({ success: false, message: 'jumlah_bayar wajib diisi' });

  const db = getDatabase();
  db.get(`SELECT * FROM keuangan WHERE nim = ?`, [nim], (err, keuangan) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!keuangan) return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });

    // Simpan riwayat pembayaran
    db.run(`
      INSERT INTO riwayat_pembayaran (nim, jumlah_bayar, metode_pembayaran, keterangan)
      VALUES (?, ?, ?, ?)
    `, [nim, jumlah_bayar, metode_pembayaran || 'transfer', keterangan || ''], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });

      // Update status tagihan
      const status = jumlah_bayar >= keuangan.nilai_ukt ? 'lunas' : 'cicilan';
      db.run(`
        UPDATE keuangan SET status_tagihan = ?, updated_at = CURRENT_TIMESTAMP WHERE nim = ?
      `, [status, nim], (err3) => {
        if (err3) return res.status(500).json({ success: false, message: err3.message });
        res.json({ success: true, message: `Pembayaran berhasil, status: ${status}` });
      });
    });
  });
};

// Riwayat pembayaran by NIM
const getRiwayatPembayaran = (req, res) => {
  const { nim } = req.params;
  const db = getDatabase();
  db.all(`
    SELECT * FROM riwayat_pembayaran WHERE nim = ? ORDER BY tanggal_bayar DESC
  `, [nim], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, total: rows.length, data: rows });
  });
};

module.exports = { getAllKeuangan, getKeuanganByNim, updateUKT, bayarUKT, getRiwayatPembayaran };