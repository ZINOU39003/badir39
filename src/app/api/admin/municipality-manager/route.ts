import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const baladiya = searchParams.get('baladiya');

    if (!baladiya) {
      return NextResponse.json({ success: false, message: "Missing baladiya name" }, { status: 400 });
    }

    const [rows]: any = await pool.execute(
      "SELECT username, password, baladiya FROM users WHERE baladiya = ? AND is_manager = true LIMIT 1",
      [baladiya]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "No manager found for this municipality" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      manager: rows[0]
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
