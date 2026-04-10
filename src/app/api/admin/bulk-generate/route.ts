import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { baladiyaName, dairaName } = await req.json();

    if (!baladiyaName || !dairaName) {
      return NextResponse.json({ success: false, message: "بيانات الموقع ناقصة" }, { status: 400 });
    }

    // Normalized username for the Municipality Manager
    const normalizedBaladiya = baladiyaName.replace("بلدية", "").trim();
    const managerUsername = `admin_${normalizedBaladiya.toLowerCase().replace(/\s+/g, '_')}`;
    // Generate a unique phone/identifier (since it's a unique key)
    const managerPhone = `mngr_${Math.floor(100000 + Date.now() % 1000000)}`;

    // 1. Check if manager already exists
    const [existing]: any = await pool.execute(
      "SELECT id FROM users WHERE baladiya = ? AND is_manager = true",
      [baladiyaName]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "مدير البلدية موجود بالفعل لهذه البلدية" });
    }

    // 2. Create the Municipality Manager account
    await pool.execute(
      `INSERT INTO users (full_name, phone, username, password, role, daira, baladiya, is_manager) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `مدير بلدية ${normalizedBaladiya}`,
        managerPhone,
        managerUsername,
        'bader123', // Default professional password
        'department', // Base role is department
        dairaName,
        baladiyaName,
        true // is_manager flag
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: `تم تعيين مدير لبلدية ${baladiyaName} بنجاح.`,
      manager: { 
        username: managerUsername,
        password: 'bader123'
      }
    });

  } catch (error: any) {
    console.error("Bulk Generate Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
