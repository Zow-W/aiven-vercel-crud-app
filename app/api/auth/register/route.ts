// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        // Mendapatkan data dari request body
        const { username, email, password } = await request.json();

        // Validasi input dasar
        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Semua field (username, email, password) harus diisi' }, { status: 400 });
        }

        // Mengecek apakah email sudah digunakan
        const [existingUsers] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email sudah terdaftar, silakan gunakan email lain' }, { status: 400 });
        }

        // Melakukan Hashing pada password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Memasukkan data user baru ke database
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        return NextResponse.json({ 
            message: 'Registrasi berhasil', 
            userId: result.insertId 
        }, { status: 201 });

    } catch (error) {
        console.error('Register API Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
    }
}