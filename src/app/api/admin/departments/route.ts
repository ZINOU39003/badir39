import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const baladiya = searchParams.get('baladiya');
    const organization = searchParams.get('organization');

    let query = "SELECT id, full_name, username, phone, organization, logo_uri, cover_uri, baladiya FROM users WHERE role = 'department'";
    const params: any[] = [];

    if (baladiya) {
      query += " AND baladiya = ?";
      params.push(baladiya);
    }
    if (organization) {
      query += " AND organization = ?";
      params.push(organization);
    }

    query += " ORDER BY full_name ASC";

    const [rows]: any = await pool.execute(query, params);
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
