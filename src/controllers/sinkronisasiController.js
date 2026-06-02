const { getDatabase } = require('../config/database');
const { getAllMahasiswa } = require('../services/mahasiswaService');

const sinkronisasiMahasiswa = async (req, res) => {
  try {
    console.log('🔄 Memulai sinkronisasi data mahasiswa...');

    const response = await getAllMahasiswa();

    let listMahasiswa = [];
    if (Array.isArray(response)) {
      listMahasiswa = response;
    } else if (response.data && Array.isArray(response.data)) {
      listMahasiswa = response.data;
    } else if (response.mahasiswa && Array.isArray(response.mahasiswa)) {
      listMahasiswa = response.mahasiswa;
    }

    console.log(`📦 Total data diterima: ${listMahasiswa.length}`);

    const db = getDatabase();
    let berhasil = 0;
    let gagal = 0;

    for (const mhs of listMahasiswa) {
      // Sesuaikan dengan struktur API: _id sebagai NIM
      const nim = mhs.nim || mhs.NIM || mhs._id || '';
      const nama = mhs.nama || mhs.name || mhs.NAMA || '';
      const prodi = mhs.programStudi || mhs.program_studi || mhs.prodi || '-';
      const mk = JSON.stringify(mhs.mataKuliah || mhs.mata_kuliah || []);
      const status = mhs.statusAkademik || mhs.status_akademik || mhs.status || 'aktif';

      if (!nim || !nama) { gagal++; continue; }

      await new Promise((resolve) => {
        db.run(`
          INSERT INTO mahasiswa (nim, nama, program_studi, mata_kuliah, status_akademik, synced_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(nim) DO UPDATE SET
            nama = excluded.nama,
            program_studi = excluded.program_studi,
            mata_kuliah = excluded.mata_kuliah,
            status_akademik = excluded.status_akademik,
            synced_at = CURRENT_TIMESTAMP
        `, [nim, nama, prodi, mk, status], (err) => {
          if (err) { console.error('DB err:', err.message); gagal++; resolve(); return; }

          db.run(`
            INSERT OR IGNORE INTO keuangan (nim, nama, nilai_ukt, status_tagihan)
            VALUES (?, ?, ?, ?)
          `, [nim, nama, 5000000, 'belum_bayar'], (err2) => {
            if (err2) { console.error('Keuangan err:', err2.message); gagal++; }
            else berhasil++;
            resolve();
          });
        });
      });
    }

    console.log(`✅ Sinkronisasi selesai: ${berhasil} berhasil, ${gagal} gagal`);

    if (res) {
      res.json({
        success: true,
        message: 'Sinkronisasi berhasil',
        data: { total: listMahasiswa.length, berhasil, gagal }
      });
    }

  } catch (error) {
    console.error('❌ Error sinkronisasi:', error.message);
    if (res) res.status(500).json({ success: false, message: error.message });
  }
};

const statusSinkronisasi = (req, res) => {
  const db = getDatabase();
  db.get(`SELECT COUNT(*) as total, MAX(synced_at) as last_sync FROM mahasiswa`, (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({
      success: true,
      data: {
        total_mahasiswa_tersinkron: row.total,
        sinkronisasi_terakhir: row.last_sync
      }
    });
  });
};

module.exports = { sinkronisasiMahasiswa, statusSinkronisasi };