import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

export async function POST(req: Request) {
  try {
    const { phone, password, username } = await req.json();

    // Support both phone and username for login
    let query = 'SELECT * FROM users WHERE phone = ? AND password = ?';
    let params = [phone || username, password];

    if (username && !phone) {
        query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        params = [username, password];
    }

    const [rows]: any = await pool.execute(query, params);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      access_token: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
