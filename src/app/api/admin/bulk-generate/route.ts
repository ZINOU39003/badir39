import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { STANDARD_SECTORS } from '@/lib/administrative-data';

export async function POST(req: Request) {
  try {
    const { baladiyaName, dairaName } = await req.json();

    if (!baladiyaName || !dairaName) {
      return NextResponse.json({ success: false, message: "Missing location data" }, { status: 400 });
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const sector of STANDARD_SECTORS) {
      // 1. Generate a clean username: sector_baladiya (simplified)
      const cleanBaladiya = baladiyaName.replace(/\s+/g, '_').toLowerCase();
      const username = `${sector.id}_${cleanBaladiya}_${Math.floor(Math.random() * 100)}`;
      const phone = `${Math.floor(Math.random() * 900000) + 100000}`; // Temporary unique identifier

      try {
        // Check if a department for this sector in this baladiya already exists
        const [existing]: any = await pool.execute(
          'SELECT id FROM users WHERE organization = ? AND baladiya = ?',
          [sector.name, baladiyaName]
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
            `${sector.name} - ${baladiyaName}`,
            phone,
            username,
            'bader123', // Standard initial password
            'department',
            sector.name,
            dairaName,
            baladiyaName,
            sector.logo
          ]
        );
        results.created++;
      } catch (err: any) {
        results.errors.push(`${sector.name}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
