import mysql from 'mysql2/promise';

// Use a singleton pattern to prevent multiple pools in dev and serverless
const globalForPool = global as unknown as { pool: mysql.Pool };

const dbConfig = {
  host: process.env.MYSQL_HOST || "mysql-159b2565-zinou.i.aivencloud.com",
  port: parseInt(process.env.MYSQL_PORT || "27815"),
  user: process.env.MYSQL_USER || "avnadmin",
  password: process.env.MYSQL_PASSWORD, // This MUST be set in Vercel env vars
  database: process.env.MYSQL_DATABASE || "defaultdb",
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

export const pool = globalForPool.pool || mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

export default pool;
