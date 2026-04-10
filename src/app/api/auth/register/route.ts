import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password, full_name, role = 'citizen', organization, username } = body;

    if (!phone || !password || !full_name) {
      return NextResponse.json({ success: false, message: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    // Insert user
    const [result]: any = await pool.execute(
      `INSERT INTO users (full_name, phone, password, role, organization, username) VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, phone, password, role, organization || null, username || null]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, phone, role, full_name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      access_token: token,
      user: {
        id: userId,
        full_name,
        phone,
        role,
        organization
      }
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: "رقم الهاتف أو اسم المستخدم مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
