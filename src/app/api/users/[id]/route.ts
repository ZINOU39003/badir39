import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await pool.execute(
      'SELECT id, full_name, phone, email, role, organization FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
