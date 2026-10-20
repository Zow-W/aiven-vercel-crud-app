// lib/db.ts
import mysql from 'mysql2/promise';

// Membaca sertifikat SSL dari Environment Variables Vercel
const caCert = process.env.DB_CA_CERT ? process.env.DB_CA_CERT.replace(/\\n/g, '\n') : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Konfigurasi SSL untuk Aiven menggunakan teks sertifikat dari Vercel
  ssl: caCert ? { ca: caCert, rejectUnauthorized: true } : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;