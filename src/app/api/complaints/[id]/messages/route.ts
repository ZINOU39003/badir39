import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows]: any = await pool.execute(
      'SELECT * FROM messages WHERE complaint_id = ? ORDER BY created_at ASC',
      [id]
    );

    return NextResponse.json({
      success: true,
      data: { items: rows }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: complaintId } = await params;
    const { sender_id, sender_name, sender_role, text } = await req.json();

    await pool.execute(
      'INSERT INTO messages (complaint_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)',
      [complaintId, sender_id, sender_name, sender_role, text]
    );

    return NextResponse.json({ success: true, message: "Message sent" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
