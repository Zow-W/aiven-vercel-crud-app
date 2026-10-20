// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
        }

        const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
        }

        // JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        return NextResponse.json({ 
            message: 'Login berhasil', 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        }, { status: 200 });

    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
    }
}