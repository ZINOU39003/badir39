import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reporter_id = searchParams.get('reporter_id');

    let query = 'SELECT * FROM complaints ORDER BY created_at DESC';
    let params: any[] = [];

    if (reporter_id) {
      query = 'SELECT * FROM complaints WHERE reporter_id = ? ORDER BY created_at DESC';
      params = [reporter_id];
    }

    const [rows]: any = await pool.execute(query, params);

    return NextResponse.json({
      success: true,
      data: { items: rows }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls = [] } = body;

    await pool.execute(
      `INSERT INTO complaints (id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, JSON.stringify(media_urls)]
    );

    return NextResponse.json({ success: true, message: "Complaint created successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
