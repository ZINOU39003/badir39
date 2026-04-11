import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.execute("SHOW VARIABLES LIKE 'max_allowed_packet'");
    const [schema]: any = await pool.execute("DESCRIBE complaints");
    
    return NextResponse.json({ 
      success: true, 
      variables: rows,
      schema: schema
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
