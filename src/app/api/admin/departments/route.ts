import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.execute(
      "SELECT id, full_name, organization, logo_uri, cover_uri, baladiya FROM users WHERE role = 'department' ORDER BY full_name ASC"
    );
    return NextResponse.json({ success: true, data: { items: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { full_name, username, phone, password, organization, logo_uri, cover_uri } = await req.json();

    await pool.execute(
      `INSERT INTO users (full_name, username, phone, password, role, organization, logo_uri, cover_uri)
       VALUES (?, ?, ?, ?, 'department', ?, ?, ?)`,
      [
        full_name, 
        username, 
        phone, 
        password, 
        organization || null, 
        logo_uri || null, 
        cover_uri || null
      ]
    );

    return NextResponse.json({ success: true, message: "Department created" });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ success: false, message: "اسم المستخدم أو الهاتف مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
