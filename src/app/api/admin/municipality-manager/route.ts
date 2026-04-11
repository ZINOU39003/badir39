import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const baladiya = searchParams.get('baladiya');
    const organization = searchParams.get('organization');

    if (!baladiya) {
      return NextResponse.json({ success: false, message: "Missing baladiya name" }, { status: 400 });
    }

    let query = "SELECT username, password, baladiya, organization, phone FROM users WHERE baladiya = ? ";
    let params: any[] = [baladiya];

    if (organization) {
      query += "AND organization = ? LIMIT 1";
      params.push(organization);
    } else {
      query += "AND is_manager = true LIMIT 1";
    }

    const [rows]: any = await pool.execute(query, params);

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

export async function PATCH(req: Request) {
  try {
    const { username, password, baladiya, organization } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 });
    }

    // Update by username or by baladiya + organization
    let query = "UPDATE users SET username = ?, password = ? WHERE ";
    let params = [username, password];

    if (baladiya && organization) {
      query += "baladiya = ? AND organization = ?";
      params.push(baladiya, organization);
    } else {
      query += "username = ?";
      params.push(username);
    }

    await pool.execute(query, params);

    return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح" });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
