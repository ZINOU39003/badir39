import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { baladiyaName, dairaName, sectorName } = await req.json();

    if (!baladiyaName || !sectorName) {
      return NextResponse.json({ success: false, message: "بيانات ناقصة" }, { status: 400 });
    }

    const normalizedBaladiya = baladiyaName.replace("بلدية", "").trim();
    // Unique username for the sector in this baladiya
    const username = `${normalizedBaladiya.toLowerCase().replace(/\s+/g, '_')}_${sectorName.toLowerCase().replace(/\s+/g, '_')}`;
    const phone = `dept_${Math.floor(100000 + Date.now() % 1000000)}`;

    try {
      // 1. Check if department already exists
      const [existing]: any = await pool.execute(
        "SELECT id FROM users WHERE baladiya = ? AND organization = ?",
        [baladiyaName, sectorName]
      );

      if (existing.length > 0) {
        return NextResponse.json({ success: false, message: "هذه المصلحة موجودة بالفعل لهذه البلدية" });
      }

      // 2. Create the Department account
      await pool.execute(
        `INSERT INTO users (full_name, phone, username, password, role, organization, daira, baladiya, is_manager) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `مصلحة ${sectorName} - ${normalizedBaladiya}`,
          phone,
          username,
          'bader123',
          'department',
          sectorName,
          dairaName,
          baladiyaName,
          false // regular department staff, not a manager
        ]
      );

      return NextResponse.json({ 
        success: true, 
        message: "تم إنشاء المصلحة بنجاح",
        manager: {
          username: username,
          password: 'bader123'
        }
      });

    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ success: false, message: "اسم المستخدم موجود مسبقاً، يرجى المحاولة لاحقاً" });
      }
      throw err;
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
