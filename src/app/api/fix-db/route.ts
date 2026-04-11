import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Attempt to upgrade the column type to LONGTEXT to handle base64 images
    await pool.execute('ALTER TABLE complaints MODIFY media_urls LONGTEXT');
    return NextResponse.json({ success: true, message: "Database schema updated to LONGTEXT" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
