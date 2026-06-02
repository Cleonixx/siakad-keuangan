const cron = require('node-cron');
const { sinkronisasiMahasiswa } = require('../controllers/sinkronisasiController');

const start = () => {
  // Jalankan sinkronisasi pertama kali saat server start
  console.log('🔄 Menjalankan sinkronisasi awal...');
  sinkronisasiMahasiswa(null, null);

  // Jadwalkan sinkronisasi otomatis setiap 1 jam
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Sinkronisasi terjadwal berjalan...');
    sinkronisasiMahasiswa(null, null);
  });

  console.log('✅ Scheduler aktif - sinkronisasi setiap 1 jam');
};

module.exports = { start };