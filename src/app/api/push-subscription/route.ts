import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    // Since we don't have a dedicated table yet, we'll store it as a temporary log 
    // or you can create the table in your DB manually:
    // CREATE TABLE IF NOT EXISTS push_subscriptions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, subscription TEXT);
    
    // For now, let's just log it to ensure it reached the server
    console.log(`New push subscription for user ${userId}:`, JSON.stringify(subscription));

    return NextResponse.json({ success: true, message: "Subscription saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
