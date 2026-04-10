import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await pool.execute('DELETE FROM users WHERE id = ? AND role = "department"', [id]);
    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
