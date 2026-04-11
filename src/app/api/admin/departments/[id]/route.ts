import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.execute("DELETE FROM users WHERE id = ? AND role = 'department'", [id]);
    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { full_name, organization, phone } = await req.json();

    await pool.execute(
      "UPDATE users SET full_name = ?, organization = ?, phone = ? WHERE id = ? AND role = 'department'",
      [full_name, organization, phone, id]
    );

    return NextResponse.json({ success: true, message: "تم تحديث بيانات المصلحة بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
