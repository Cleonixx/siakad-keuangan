const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = process.env.MAHASISWA_API_URL;

// Ambil semua data mahasiswa dari API
const getAllMahasiswa = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/mahasiswa`);
    return response.data;
  } catch (error) {
    console.error('❌ Gagal fetch data mahasiswa:', error.message);
    throw error;
  }
};

// Ambil data mahasiswa by NIM dari API
const getMahasiswaByNim = async (nim) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/mahasiswa/${nim}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Gagal fetch mahasiswa NIM ${nim}:`, error.message);
    throw error;
  }
};

module.exports = { getAllMahasiswa, getMahasiswaByNim };