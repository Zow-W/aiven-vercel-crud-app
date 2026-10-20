// app/api/items/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function verifyToken(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as { userId: number; email: string; username: string };
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Tidak memiliki akses (Unauthorized)' }, { status: 401 });
        }

        const [items] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
            [user.userId]
        );

        return NextResponse.json({ data: items }, { status: 200 });

    } catch (error) {
        console.error('GET Items API Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Tidak memiliki akses (Unauthorized)' }, { status: 401 });
        }

        const { title, description, content, image_url } = await request.json();

        if (!title || !description || !content) {
            return NextResponse.json({ error: 'Title, description, dan content wajib diisi' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO items (user_id, title, description, content, image_url) VALUES (?, ?, ?, ?, ?)',
            [user.userId, title, description, content, image_url || null]
        );

        return NextResponse.json({ 
            message: 'Data berhasil ditambahkan', 
            itemId: result.insertId 
        }, { status: 201 });

    } catch (error) {
        console.error('POST Items API Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: Request) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Tidak memiliki akses (Unauthorized)' }, { status: 401 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM items WHERE user_id = ?',
            [user.userId]
        );

        return NextResponse.json({ message: 'Semua data berhasil dihapus' }, { status: 200 });

    } catch (error) {
        console.error('DELETE All API Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
    }
}