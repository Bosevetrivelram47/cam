// D:\2025-2026\Project\machine-monitor-dashboard-backend\db.js
const mysql = require('mysql2/promise'); // Using promise-based API

// Load environment variables
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z', // Max number of connections in the pool
    queueLimit: 0 // No limit for queued requests
});

console.log(`Attempting to connect to MySQL: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`);

// Verify connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL database!');
        connection.release(); // Release the connection immediately
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit process if database connection fails
    });

module.exports = pool;