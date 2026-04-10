import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password, full_name, role = 'citizen', organization, username, email } = body;

    // Validate Algerian Phone Number (05, 06, 07 followed by 8 digits)
    const algerianPhoneRegex = /^0[567][0-9]{8}$/;
    if (!algerianPhoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: "يرجى إدخال رقم هاتف جزائري صحيح (يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام)" }, { status: 400 });
    }

    if (!phone || !password || !full_name) {
      return NextResponse.json({ success: false, message: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    // Insert user
    const [result]: any = await pool.execute(
      `INSERT INTO users (full_name, phone, password, role, organization, username, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, phone, password, role, organization || null, username || null, email || null]
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
      let message = "البيانات المدخلة مسجلة مسبقاً";
      if (error.sqlMessage && error.sqlMessage.includes('phone')) message = "رقم الهاتف مسجل مسبقاً";
      if (error.sqlMessage && error.sqlMessage.includes('email')) message = "البريد الإلكتروني مسجل مسبقاً";
      if (error.sqlMessage && error.sqlMessage.includes('username')) message = "اسم المستخدم مسجل مسبقاً";
      
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
