import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Create Users Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('citizen', 'department', 'admin') DEFAULT 'citizen',
        organization VARCHAR(100),
        logo_uri TEXT,
        cover_uri TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Complaints Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location_text TEXT NOT NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        category VARCHAR(100),
        status ENUM('submitted', 'under_review', 'in_progress', 'resolved') DEFAULT 'submitted',
        reporter_id INT,
        assigned_dept VARCHAR(100),
        media_urls JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Messages Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id VARCHAR(50) NOT NULL,
        sender_id INT,
        sender_name VARCHAR(255),
        sender_role VARCHAR(50),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
      )
    `);

    // 4. Initialize Admin
    await pool.execute(`
      INSERT INTO users (phone, password, full_name, role)
      VALUES ('admin', 'admin123', 'مدير النظام', 'admin')
      ON DUPLICATE KEY UPDATE password = 'admin123', role = 'admin'
    `);

    return NextResponse.json({ success: true, message: "Database initialized successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
