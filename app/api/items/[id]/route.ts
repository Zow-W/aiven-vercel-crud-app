// app/api/items/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function verifyToken(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const user = verifyToken(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;

        const [items] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM items WHERE id = ? AND user_id = ?',
            [id, user.userId]
        );

        if (items.length === 0) {
            return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ data: items[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const user = verifyToken(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const { title, description, content, image_url } = await request.json();

        if (!title || !description || !content) {
            return NextResponse.json({ error: 'Title, description, dan content wajib diisi' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE items SET title = ?, description = ?, content = ?, image_url = ? WHERE id = ? AND user_id = ?',
            [title, description, content, image_url || null, id, user.userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Data tidak ditemukan atau bukan milik Anda' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Data berhasil diperbarui' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const user = verifyToken(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM items WHERE id = ? AND user_id = ?',
            [id, user.userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Data tidak ditemukan atau bukan milik Anda' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Data berhasil dihapus' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
    }
}