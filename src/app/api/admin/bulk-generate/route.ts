import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { STANDARD_SECTORS } from '@/lib/administrative-data';

export async function POST(req: Request) {
  try {
    const { baladiyaName, dairaName } = await req.json();

    if (!baladiyaName || !dairaName) {
      return NextResponse.json({ success: false, message: "بيانات الموقع ناقصة" }, { status: 400 });
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Normalize input names
    const normalizedBaladiya = baladiyaName.trim();
    const normalizedDaira = dairaName.trim();

    for (const sector of STANDARD_SECTORS) {
      // 1. Generate a clean username
      // Use timestamp + random to ensure phone uniqueness
      const ts = Date.now().toString().slice(-6);
      const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const uniqueSuffix = `${ts}${rand}`;
      
      const cleanSector = sector.id.toLowerCase();
      // Use first 3 letters of baladiya for username to keep it short
      const username = `${cleanSector}_${uniqueSuffix}`;
      const phone = `00${uniqueSuffix}`; 

      try {
        // Check if EXACTLY this sector for this baladiya already exists
        const [existing]: any = await pool.execute(
          'SELECT id FROM users WHERE organization = ? AND baladiya = ?',
          [sector.name, normalizedBaladiya]
        );

        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Create the department account
        await pool.execute(
          `INSERT INTO users (full_name, phone, username, password, role, organization, daira, baladiya, logo_uri) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${sector.name} - ${normalizedBaladiya}`,
            phone,
            username,
            'bader123', 
            'department',
            sector.name,
            normalizedDaira,
            normalizedBaladiya,
            sector.logo
          ]
        );
        results.created++;
      } catch (err: any) {
        results.errors.push(`${sector.name}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: results.created > 0 
        ? `تم إنشاء ${results.created} مصلحة بنجاح.` 
        : results.skipped === STANDARD_SECTORS.length 
          ? "جميع المصالح محملة مسبقاً لهذا الموقع."
          : "لم يتم إنشاء مصالح جديدة، يرجى التحقق من الأخطاء."
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
