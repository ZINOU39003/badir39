import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "mysql-159b2565-zinou.i.aivencloud.com",
  port: parseInt(process.env.MYSQL_PORT || "27815"),
  user: process.env.MYSQL_USER || "avnadmin",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "defaultdb",
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
