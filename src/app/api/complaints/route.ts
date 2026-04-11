import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reporter_id = searchParams.get('reporter_id');
    const daira = searchParams.get('daira');
    const baladiya = searchParams.get('baladiya');
    const dept = searchParams.get('dept');

    let query = 'SELECT * FROM complaints WHERE 1=1';
    let params: any[] = [];

    if (reporter_id) {
      query += ' AND reporter_id = ?';
      params.push(reporter_id);
    }
    
    if (daira) {
      query += ' AND district = ?';
      params.push(daira);
    }

    if (baladiya) {
      query += ' AND municipality = ?';
      params.push(baladiya);
    }

    if (dept) {
      query += ' AND assigned_dept = ?';
      params.push(dept);
    }

    query += ' ORDER BY created_at DESC';

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
    const { 
      id, title, description, location_text, lat, lng, 
      category, reporter_id, assigned_dept, media_urls = [],
      district, municipality 
    } = body;

    console.log("Creating complaint with payload:", JSON.stringify(body, null, 2));

    await pool.execute(
      `INSERT INTO complaints (id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls, district, municipality)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, description, location_text, lat, lng, 
        category, reporter_id, assigned_dept, JSON.stringify(media_urls),
        district, municipality
      ]
    );

    return NextResponse.json({ success: true, message: "Complaint created successfully" });
  } catch (error: any) {
    console.error("CRITICAL_COMPLAINT_FAILURE:", error);
    return NextResponse.json({ 
      success: false, 
      message: `فشل الإرسال: ${error.message}` 
    }, { status: 500 });
  }
}
