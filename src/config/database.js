const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');

let db;

const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Gagal membuka database:', err.message);
      } else {
        console.log('✅ Terhubung ke SQLite database');
      }
    });
  }
  return db;
};

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.serialize(() => {
      // Tabel mahasiswa (data dari API Mahasiswa)
      db.run(`
        CREATE TABLE IF NOT EXISTS mahasiswa (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nim TEXT UNIQUE NOT NULL,
          nama TEXT NOT NULL,
          program_studi TEXT,
          mata_kuliah TEXT,
          status_akademik TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabel keuangan
      db.run(`
        CREATE TABLE IF NOT EXISTS keuangan (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nim TEXT UNIQUE NOT NULL,
          nama TEXT NOT NULL,
          nilai_ukt REAL DEFAULT 0,
          status_tagihan TEXT DEFAULT 'belum_bayar',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (nim) REFERENCES mahasiswa(nim)
        )
      `);

      // Tabel riwayat pembayaran
      db.run(`
        CREATE TABLE IF NOT EXISTS riwayat_pembayaran (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nim TEXT NOT NULL,
          jumlah_bayar REAL NOT NULL,
          tanggal_bayar DATETIME DEFAULT CURRENT_TIMESTAMP,
          metode_pembayaran TEXT DEFAULT 'transfer',
          keterangan TEXT,
          FOREIGN KEY (nim) REFERENCES keuangan(nim)
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Semua tabel berhasil dibuat');
          resolve();
        }
      });
    });
  });
};

module.exports = { getDatabase, initDatabase };