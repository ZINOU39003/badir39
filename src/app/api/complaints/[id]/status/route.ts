import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['submitted', 'under_review', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    await pool.execute(
      'UPDATE complaints SET status = ? WHERE id = ?',
      [status, id]
    );

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
