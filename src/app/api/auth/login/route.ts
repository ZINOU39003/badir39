import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

export async function POST(req: Request) {
  try {
    const { phone, password, username } = await req.json();

    // Flexible identifier: can be phone or username
    const identifier = phone || username;

    // Search for user by phone OR username
    let rows: any[] = [];
    try {
      const query = 'SELECT * FROM users WHERE (phone = ? OR username = ?) AND password = ?';
      const params = [identifier, identifier, password];
      const [result]: any = await pool.execute(query, params);
      rows = result;
    } catch (dbError: any) {
      console.error("Database Login Error:", dbError);
      return NextResponse.json({ 
        success: false, 
        message: "خطأ في الاتصال بقاعدة البيانات. يرجى مراجعة إعدادات السيرفر." 
      }, { status: 500 });
    }

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
        organization: user.organization,
        daira: user.daira,
        baladiya: user.baladiya,
        is_manager: Boolean(user.is_manager)
      }
    });
  } catch (error: any) {
    console.error("Auth Login System Error:", error);
    return NextResponse.json({ success: false, message: "حدث خطأ غير متوقع في النظام" }, { status: 500 });
  }
}
