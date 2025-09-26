// D:\2025-2026\Project\machine-monitor-dashboard-backend\db.js

// Import syntax for ESM
import mysql from "mysql2";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create the pool from the main 'mysql2' object, then call .promise() on the result
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: "Z",
    queueLimit: 0
}).promise(); // Use promise-based API

console.log(
    `Attempting to connect to MySQL: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`
);

// Verify connection (skip in test environment)
if (process.env.NODE_ENV !== "test") {
    pool.getConnection()
        .then((connection) => {
            console.log("✅ Successfully connected to the MySQL database!");
            connection.release();
        })
        .catch((err) => {
            console.error("❌ Error connecting to the database:", err.message);
            process.exit(1); // Exit process if database connection fails
        });
}

export default pool;
