import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Create Users Table (Base)
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Complaints Table (Base)
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

    // --- MIGRATIONS (Adding columns to existing tables) ---
    const migrations = [
      // Users migrations
      { table: 'users', column: 'daira', definition: 'VARCHAR(100)' },
      { table: 'users', column: 'baladiya', definition: 'VARCHAR(100)' },
      { table: 'users', column: 'is_manager', definition: 'BOOLEAN DEFAULT FALSE' },
      // Complaints migrations
      { table: 'complaints', column: 'district', definition: 'VARCHAR(100)' },
      { table: 'complaints', column: 'municipality', definition: 'VARCHAR(100)' }
    ];

    for (const migration of migrations) {
      try {
        await pool.execute(`ALTER TABLE ${migration.table} ADD COLUMN ${migration.column} ${migration.definition}`);
      } catch (err: any) {
        // Silently skip if column already exists
        if (!err.message.includes('Duplicate column name')) {
          console.error(`Migration error on ${migration.table}.${migration.column}:`, err.message);
        }
      }
    }

    // 4. Initialize Admin
    await pool.execute(`
      INSERT INTO users (phone, password, full_name, role)
      VALUES ('admin', 'admin123', 'مدير النظام', 'admin')
      ON DUPLICATE KEY UPDATE password = 'admin123', role = 'admin'
    `);

    return NextResponse.json({ success: true, message: "Database initialized and migrated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
