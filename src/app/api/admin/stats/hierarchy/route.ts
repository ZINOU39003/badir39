import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // This query group by baladiya and counts the number of department accounts
    const [rows]: any = await pool.execute(
      "SELECT baladiya, COUNT(*) as count FROM users WHERE role = 'department' GROUP BY baladiya"
    );

    const stats: Record<string, number> = {};
    rows.forEach((row: any) => {
      if (row.baladiya) {
        stats[row.baladiya] = row.count;
      }
    });

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
