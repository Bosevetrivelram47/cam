//Files to Import:
import  {authMiddleWare}  from './MiddleWare/auth.js';
import dotenv from "dotenv";
import { DEFAULT_TIMEOUT, UDP_PORT, DISCOVERY_MESSAGE } from "./config.js";
import { discoverDeviceUDP, calculatePrimaryBroadcastAddress } from './discovery.js';
import  { parseMachineStatusResponse } from './utils.js'; // Assuming parseMachineStatusResponse moved to utils.
import  db from './db.js'; // Import the database connection pool
//import  dgram from "dgram";
import  nodemailer from 'nodemailer';
//import  bodyParser from 'body-parser';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit'; // NEW: Import pdfkit
import express from 'express';
import  cors from 'cors'; // Import the CORS middleware
//import  os  from 'os';

// ES modified 
import { fileURLToPath } from 'url';
import { basename } from 'path';

const isMainModule = basename(fileURLToPath(import.meta.url)) === process.argv[1].split(/[\\/]/).pop();

// Load environment variables from .env file
dotenv.config();
// machine-monitor-dashboard-backend/server.js



//const getStream = require('get-stream'); // NEW: Import get-stream to collect stream data

const app = express();
const PORT = process.env.PORT ; // Use port from .env 
app.use('/auth',authMiddleWare);//for Middle ware login based authentication

// --- Constants for UDP Discovery ---
const BROADCAST_PORT = process.env.BROADCAST_PORT;
//const DISCOVERY_MESSAGE = Buffer.from("M99999");
const RECEIVE_TIMEOUT = process.env.RECEIVE_TIMEOUT;

// Default timeout for UDP discovery in milliseconds
//const UDP_PORT = 3001; // Port to listen for UDP responses
//const DISCOVERY_MESSAGE = 'DISCOVER_DEVICE';


// --- Middleware ---
// Enable CORS for your frontend application
// Replace 'http://localhost:5173' with the actual URL of your React frontend
// In production, this should be your deployed frontend URL
app.use(cors({
    origin: 'http://localhost:5173' // Your React app's development server URL
}));

// Body parser middleware for JSON data
app.use(express.json());

// --- MOCK DATA FOR DEVELOPMENT (REPLACE WITH REAL DATABASE/SERVICE CALLS IN PRODUCTION) ---

const mockMachines = [
    // Class 1 Machines (Expanded Details)
    {
        id: 'M001',
        name: 'Elegoo-Saturn-4-001',
        classId: 'class1',
        status: 'Running',
        jobType: 'Milling',
        jobStartedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        estimatedRemainingTimeSec: 1800,
        temperature: 78,
        pressure: 5.2,
        lastUpdated: new Date().toISOString(),
        runtimeHours: 150.5,
        idleHours: 25.1,
        productivityScore: 92, // Percentage or score
        maintenanceLogs: [
            { date: '2025-05-10', description: 'Lubrication and calibration', performedBy: 'Technician A' },
            { date: '2025-03-15', description: 'Motor inspection', performedBy: 'Technician B' }
        ],
        failureHistory: [
            { date: '2025-06-01', description: 'Spindle motor overheat', severity: 'High', action: 'Replaced cooling fan' },
            { date: '2024-11-20', description: 'Tool changer jam', severity: 'Medium', action: 'Adjusted mechanism' }
        ],
        // Mock data for machine-specific charts
        performanceData: {
            daily: [
                { name: '08:00', value: 10 }, { name: '09:00', value: 15 }, { name: '10:00', value: 12 },
                { name: '11:00', value: 18 }, { name: '12:00', value: 14 }, { name: '13:00', value: 20 },
                { name: '14:00', value: 16 }, { name: '15:00', value: 19 }
            ], // e.g., jobs completed per hour
            weekly: [
                { name: 'Mon', value: 120 }, { name: 'Tue', value: 150 }, { name: 'Wed', value: 110 },
                { name: 'Thu', value: 130 }, { name: 'Fri', value: 160 }, { name: 'Sat', value: 70 },
                { name: 'Sun', value: 30 }
            ], // e.g., total jobs per day
            monthly: [
                { name: 'Week 1', value: 700 }, { name: 'Week 2', value: 750 }, { name: 'Week 3', value: 680 }, { name: 'Week 4', value: 720 }
            ] // e.g., total jobs per week
        }
    },
    { id: 'M002', name: 'Elegoo-Saturn-4-002', classId: 'class1', status: 'Maintenance', temperature: 40, pressure: 0.5, lastUpdated: new Date(Date.now() - 60 * 1000).toISOString(), runtimeHours: 100.2, idleHours: 50.8, productivityScore: 85, maintenanceLogs: [{ date: '2025-06-25', description: 'Scheduled annual maintenance', performedBy: 'Technician C' }], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M003', name: 'Elegoo-Saturn-4-003', classId: 'class1', status: 'Running', jobType: 'Drilling', jobStartedAt: new Date(Date.now() - 1200 * 1000).toISOString(), estimatedRemainingTimeSec: 600, temperature: 72, pressure: 4.8, lastUpdated: new Date().toISOString(), runtimeHours: 200.0, idleHours: 10.0, productivityScore: 95, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M004', name: 'Elegoo-Saturn-4-004', classId: 'class1', status: 'Stopped', temperature: 25, pressure: 0.1, lastUpdated: new Date(Date.now() - 300 * 1000).toISOString(), runtimeHours: 80.0, idleHours: 70.0, productivityScore: 70, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M005', name: 'Elegoo-Saturn-4-005', classId: 'class1', status: 'Running', jobType: 'Turning', jobStartedAt: new Date(Date.now() - 7200 * 1000).toISOString(), estimatedRemainingTimeSec: 3600, temperature: 80, pressure: 5.5, lastUpdated: new Date().toISOString(), runtimeHours: 180.0, idleHours: 30.0, productivityScore: 90, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },

    // Class 2 Machines (Simplified for brevity, but can be expanded similarly)
    { id: 'M006', name: 'Elegoo-Saturn-3-001', classId: 'class2', status: 'Running', jobType: 'Engraving', jobStartedAt: new Date(Date.now() - 1800 * 1000).toISOString(), estimatedRemainingTimeSec: 900, temperature: 65, pressure: 3.1, lastUpdated: new Date().toISOString(), runtimeHours: 120.0, idleHours: 15.0, productivityScore: 88, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M007', name: 'Elegoo-Saturn-3-002', classId: 'class2', status: 'Running', jobType: 'Cutting', jobStartedAt: new Date(Date.now() - 5400 * 1000).toISOString(), estimatedRemainingTimeSec: 2700, temperature: 70, pressure: 3.5, lastUpdated: new Date().toISOString(), runtimeHours: 90.0, idleHours: 20.0, productivityScore: 82, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M008', name: 'Elegoo-Saturn-3-003', classId: 'class2', status: 'Stopped', temperature: 28, pressure: 0.2, lastUpdated: new Date(Date.now() - 10000).toISOString(), runtimeHours: 50.0, idleHours: 30.0, productivityScore: 65, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M009', name: 'Elegoo-Saturn-3-004', classId: 'class2', status: 'Maintenance', temperature: 35, pressure: 0.3, lastUpdated: new Date(Date.now() - 20000).toISOString(), runtimeHours: 70.0, idleHours: 40.0, productivityScore: 75, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },

    // Class 3 Machines
    { id: 'M010', name: 'The-One-001', classId: 'class3', status: 'Running', jobType: 'Assembly', jobStartedAt: new Date(Date.now() - 900 * 1000).toISOString(), estimatedRemainingTimeSec: 450, temperature: 55, pressure: 1.2, lastUpdated: new Date().toISOString(), runtimeHours: 110.0, idleHours: 10.0, productivityScore: 90, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M011', name: 'The-One-002', classId: 'class3', status: 'Stopped', temperature: 20, pressure: 0.0, lastUpdated: new Date(Date.now() - 5000).toISOString(), runtimeHours: 60.0, idleHours: 50.0, productivityScore: 60, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M012', name: 'The-One-003', classId: 'class3', status: 'Running', jobType: 'Packaging', jobStartedAt: new Date(Date.now() - 2700 * 1000).toISOString(), estimatedRemainingTimeSec: 1350, temperature: 60, pressure: 2.0, lastUpdated: new Date().toISOString(), runtimeHours: 130.0, idleHours: 5.0, productivityScore: 98, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },

    // Class 4 Machines
    { id: 'M013', name: 'Kaizer-001', classId: 'class4', status: 'Running', temperature: 22, pressure: 0.1, lastUpdated: new Date().toISOString(), runtimeHours: 20.0, idleHours: 2.0, productivityScore: 99, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M014', name: 'Kaizer-002', classId: 'class4', status: 'Running', temperature: 28, pressure: 0.0, lastUpdated: new Date().toISOString(), runtimeHours: 30.0, idleHours: 1.0, productivityScore: 99, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M015', name: 'Kaizer-003', classId: 'class4', status: 'Maintenance', temperature: 30, pressure: 0.0, lastUpdated: new Date(Date.now() - 15000).toISOString(), runtimeHours: 10.0, idleHours: 5.0, productivityScore: 80, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
];



const mockMachineClasses = [
    { id: 'class1', name: 'Class 1 (Elegoo-Saturn-4)', onCount: 3, offCount: 1, maintenanceCount: 1, runningTimeProductionHours: 1600 },
    { id: 'class2', name: 'Class 2 (Elegoo-Saturn-3 )', onCount: 2, offCount: 1, maintenanceCount: 1, runningTimeProductionHours: 800 },
    { id: 'class3', name: 'Class 3 (The-One)', onCount: 2, offCount: 1, maintenanceCount: 0, runningTimeProductionHours: 1200 },
    { id: 'class4', name: 'Class 4 (Kaizer)', onCount: 2, offCount: 0, maintenanceCount: 1, runningTimeProductionHours: 400 },
];
// Helper to generate mock chart data
const generateMockChartData = (type) => {
    if (type === 'daily') {
        return [
            { name: 'Job 1', value: 50, timeTaken: 120 }, // 50 jobs, 120 mins
            { name: 'Job 2', value: 30, timeTaken: 90 },
            { name: 'Job 3', value: 45, timeTaken: 150 },
            { name: 'Job 4', value: 60, timeTaken: 180 },
        ];
    } else if (type === 'weekly') {
        return [
            { name: 'Mon', value: 120, runtimeHours: 80 },
            { name: 'Tue', value: 150, runtimeHours: 95 },
            { name: 'Wed', value: 110, runtimeHours: 70 },
            { name: 'Thu', value: 130, runtimeHours: 85 },
            { name: 'Fri', value: 160, runtimeHours: 100 },
            { name: 'Sat', value: 70, runtimeHours: 40 },
            { name: 'Sun', value: 30, runtimeHours: 20 },
        ];
    } else if (type === 'monthly') {
        return [
            { name: 'Week 1', value: 700, runtimeHours: 400 },
            { name: 'Week 2', value: 750, runtimeHours: 420 },
            { name: 'Week 3', value: 680, runtimeHours: 380 },
            { name: 'Week 4', value: 720, runtimeHours: 410 },
        ];
    }
    return [];
};
/*
// --- Helper function to generate a table in PDF ---
function generateTable(doc, data, columns, startY) {
    const tableTop = startY || doc.y;
    const itemPerRow = columns.length;
    let currentRow = 0;
    let currentY = tableTop;
    const rowHeight = 25; // Adjusted for better spacing
    const cellPadding = 5;

    // Draw Headers
    doc.font('Helvetica-Bold').fontSize(10);
    let xOffset = doc.page.margins.left;
    columns.forEach(col => {
        doc.text(col.label, xOffset, currentY + cellPadding, {
            width: col.width - cellPadding * 2,
            align: 'left'
        });
        xOffset += col.width;
    });

    // Draw header bottom line
    doc.lineWidth(1).strokeColor('#aaaaaa');
    doc.lineCap('butt')
        .moveTo(doc.page.margins.left, currentY + rowHeight)
        .lineTo(doc.page.width - doc.page.margins.right, currentY + rowHeight)
        .stroke();

    currentY += rowHeight;

    // Draw Rows
    doc.font('Helvetica').fontSize(9);
    data.forEach((item, rowIndex) => {
        currentRow = rowIndex;
        let xOffset = doc.page.margins.left;
        let maxRowHeight = rowHeight; // To account for multi-line text in a cell

        columns.forEach(col => {
            const value = item[col.property] !== undefined ? item[col.property] : 'N/A';
            const text = String(value);

            // Calculate text height for this cell
            const textHeight = doc.heightOfString(text, { width: col.width - cellPadding * 2 });
            maxRowHeight = Math.max(maxRowHeight, textHeight + cellPadding * 2);

            doc.text(text, xOffset, currentY + cellPadding, {
                width: col.width - cellPadding * 2,
                align: 'left'
            });
            xOffset += col.width;
        });

        // Draw row bottom line
        doc.lineWidth(0.5).strokeColor('#dddddd');
        doc.lineCap('butt')
            .moveTo(doc.page.margins.left, currentY + maxRowHeight)
            .lineTo(doc.page.width - doc.page.margins.right, currentY + maxRowHeight)
            .stroke();

        currentY += maxRowHeight;

        // Add a new page if content goes beyond current page height
        if (currentY + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            currentY = doc.page.margins.top;
            // Redraw headers on new page
            doc.font('Helvetica-Bold').fontSize(10);
            let newPageXOffset = doc.page.margins.left;
            columns.forEach(col => {
                doc.text(col.label, newPageXOffset, currentY + cellPadding, {
                    width: col.width - cellPadding * 2,
                    align: 'left'
                });
                newPageXOffset += col.width;
            });
            doc.lineWidth(1).strokeColor('#aaaaaa');
            doc.lineCap('butt')
                .moveTo(doc.page.margins.left, currentY + rowHeight)
                .lineTo(doc.page.width - doc.page.margins.right, currentY + rowHeight)
                .stroke();
            currentY += rowHeight;
            doc.font('Helvetica').fontSize(9); // Revert to row font
        }
    });
    doc.moveDown(); // Move cursor down after table
    return currentY; // Return the final Y position after the table
}*/

// --- Helper function to generate a table in PDF ---
function generateTable(doc, data, columns, startY) {
    let currentY = startY || doc.y; // Ensure a fallback startY

    // Add a debug log to confirm data is received by generateTable
    console.log('generateTable called. Data length:', data ? data.length : 0, 'Columns defined:', columns.length);

    // If data is empty or null, display a message instead of drawing a table
    if (!data || data.length === 0) {
        doc.fontSize(12).text('No data available for this report.', doc.page.margins.left, currentY + 10);
        doc.moveDown(); // Move cursor down after the message
        return doc.y; // Return the new Y position
    }

    const rowHeight = 25;
    const cellPadding = 5;

    // Draw Headers
    doc.font('Helvetica-Bold').fontSize(10);
    let xOffset = doc.page.margins.left;
    columns.forEach(col => {
        doc.text(col.label, xOffset, currentY + cellPadding, {
            width: col.width - cellPadding * 2,
            align: 'left'
        });
        xOffset += col.width;
    });

    currentY += rowHeight;

    // Draw header bottom line
    doc.lineWidth(1).strokeColor('#aaaaaa');
    doc.lineCap('butt')
        .moveTo(doc.page.margins.left, currentY)
        .lineTo(doc.page.width - doc.page.margins.right, currentY)
        .stroke();

    currentY += 5; // Small gap after header line

    // Draw Rows
    doc.font('Helvetica').fontSize(9);
    data.forEach((item) => { // Removed rowIndex as it's not directly used for drawing position
        let xRowOffset = doc.page.margins.left;
        let maxRowHeight = 0; // Initialize for each row to find max height needed

        columns.forEach(col => {
            const value = item[col.property] !== undefined ? item[col.property] : 'N/A';
            const text = String(value);

            // Calculate text height for this cell
            const textHeight = doc.heightOfString(text, { width: col.width - cellPadding * 2 });
            maxRowHeight = Math.max(maxRowHeight, textHeight); // Max height needed for this row based on content

            doc.text(text, xRowOffset, currentY + cellPadding, {
                width: col.width - cellPadding * 2,
                align: 'left'
            });
            xRowOffset += col.width;
        });

        // Add padding to maxRowHeight
        maxRowHeight += cellPadding * 2; // Add padding to top and bottom of text height

        currentY += maxRowHeight; // Move Y down after drawing current row

        // Draw row bottom line
        doc.lineWidth(0.5).strokeColor('#dddddd');
        doc.lineCap('butt')
            .moveTo(doc.page.margins.left, currentY)
            .lineTo(doc.page.width - doc.page.margins.right, currentY)
            .stroke();

        // Add a new page if content goes beyond current page height
        // This check should consider the height of the next row if it were to be drawn
        if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) { // Check if space for next row
            doc.addPage();
            currentY = doc.page.margins.top;
            // Redraw headers on new page
            doc.font('Helvetica-Bold').fontSize(10);
            let newPageXOffset = doc.page.margins.left;
            columns.forEach(col => {
                doc.text(col.label, newPageXOffset, currentY + cellPadding, {
                    width: col.width - cellPadding * 2,
                    align: 'left'
                });
                newPageXOffset += col.width;
            });
            currentY += rowHeight;
            doc.lineWidth(1).strokeColor('#aaaaaa');
            doc.lineCap('butt')
                .moveTo(doc.page.margins.left, currentY)
                .lineTo(doc.page.width - doc.page.margins.right, currentY)
                .stroke();
            currentY += 5; // Small gap after header line
            doc.font('Helvetica').fontSize(9); // Revert to row font
        }
    });
    doc.moveDown(); // Move cursor down after table
    return doc.y; // Return the final Y position using doc.y for consistency
}


/* // Get all machine classes (for sidebar and dropdowns)
app.get('/api/machine-classes', async (req, res) => {
    console.log('GET /api/machine-classes request received');
    try {
        const [rows] = await db.query('SELECT id, name FROM machine_classes');

        // To calculate on/off/maintenance counts directly from machines table for overview
        const [machineCounts] = await db.query(`
            SELECT
                class_id,
                SUM(CASE WHEN status = 'Running' THEN 1 ELSE 0 END) as onCount,
                SUM(CASE WHEN status = 'Stopped' THEN 1 ELSE 0 END) as offCount,
                SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenanceCount,
                SUM(runtime_hours) as runningTimeProductionHours
            FROM machines
            GROUP BY class_id
        `);

        // Combine class names with their counts
        const classOverviews = rows.map(cls => {
            const counts = machineCounts.find(mc => mc.class_id === cls.id);
            return {
                id: cls.id,
                name: cls.name,
                onCount: counts ? counts.onCount : 0,
                offCount: counts ? counts.offCount : 0,
                maintenanceCount: counts ? counts.maintenanceCount : 0,
                runningTimeProductionHours: counts ? parseFloat(counts.runningTimeProductionHours.toFixed(2)) : 0
            };
        });

        res.json(classOverviews);
    } catch (err) {
        console.error('Error fetching machine classes:', err);
        res.status(500).json({ message: 'Error fetching machine classes from database' });
    }
});
 */
/*
// Get all machine classes (for sidebar and dropdowns)
app.get('/api/machine-classes', async (req, res) => {
    console.log('GET /api/machine-classes request received');
    try {
        const [rows] = await db.query('SELECT id, name FROM machine_classes');

        // To calculate on/off/maintenance counts directly from machines table for overview
        const [machineCounts] = await db.query(`
            SELECT
                class_id,
                SUM(CASE WHEN status = 'Running' THEN 1 ELSE 0 END) as onCount,
                SUM(CASE WHEN status = 'Stopped' THEN 1 ELSE 0 END) as offCount,
                SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenanceCount,
                SUM(runtime_hours) as runningTimeProductionHours
            FROM machines
            GROUP BY class_id
        `);

        // Combine class names with their counts
        const classOverviews = rows.map(cls => {
            const counts = machineCounts.find(mc => mc.class_id === cls.id);
            return {
                id: cls.id,
                name: cls.name,
                onCount: counts ? counts.onCount : 0,
                offCount: counts ? counts.offCount : 0,
                maintenanceCount: counts ? counts.maintenanceCount : 0,
                // FIX: Check if counts and counts.runningTimeProductionHours exist before calling toFixed
                runningTimeProductionHours: (counts && counts.runningTimeProductionHours !== null && counts.runningTimeProductionHours !== undefined)
                                            ? parseFloat(counts.runningTimeProductionHours.toFixed(2))
                                            : 0 // Default to 0 if null/undefined
            };
        });

        res.json(classOverviews);
    } catch (err) {
        console.error('Error fetching machine classes:', err);
        res.status(500).json({ message: 'Error fetching machine classes from database' });
    }
}); */

// Get all machine classes (for sidebar and dropdowns, including dashboard overview counts)
app.get('/api/machine-classes', async (req, res) => {
    console.log('GET /api/machine-classes request received');
    try {
        const [rows] = await db.query('SELECT id, name FROM machine_classes');

        // To calculate on/off/maintenance counts directly from machines table for overview
        const [machineCounts] = await db.query(`
            SELECT
                class_id,
                SUM(CASE WHEN status = 'Running' THEN 1 ELSE 0 END) as onCount,
                SUM(CASE WHEN status = 'Stopped' THEN 1 ELSE 0 END) as offCount,
                SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenanceCount,
                SUM(runtime_hours) as runningTimeProductionHours
            FROM machines
            GROUP BY class_id
        `);

        // Combine class names with their counts
        const classOverviews = rows.map(cls => {
            const counts = machineCounts.find(mc => mc.class_id === cls.id);
            return {
                id: cls.id,
                name: cls.name,
                onCount: counts ? counts.onCount : 0,
                offCount: counts ? counts.offCount : 0,
                maintenanceCount: counts ? counts.maintenanceCount : 0,
                // FIX: Ensure counts and counts.runningTimeProductionHours exist before calling toFixed
                runningTimeProductionHours: (counts && counts.runningTimeProductionHours !== null && counts.runningTimeProductionHours !== undefined)
                    ? parseFloat(counts.runningTimeProductionHours.toFixed(2))
                    : 0 // Default to 0 if null/undefined
            };
        });

        res.json(classOverviews);
    } catch (err) {
        console.error('Error fetching machine classes:', err);
        res.status(500).json({ message: 'Error fetching machine classes from database' });
    }
});


// Get machines by class ID (or all machines if no classId provided)
// This is the endpoint for LISTING MACHINES
app.get('/api/machines', async (req, res) => {
    const { classId } = req.query; // Get classId from query parameters
    console.log(`GET /api/machines request received for classId: ${classId || 'all'}`);

    try {
        let query = 'SELECT id, name, class_id AS classId, status, job_type AS jobType, job_started_at AS jobStartedAt, estimated_remaining_time_sec AS estimatedRemainingTimeSec, temperature, pressure, last_updated AS lastUpdated, runtime_hours AS runtimeHours, idle_hours AS idleHours, productivity_score AS productivityScore FROM machines';
        let params = [];

        // ONLY add the WHERE clause if classId is provided
        if (classId) {
            query += ' WHERE class_id = ?';
            params.push(classId);
        }

        const [rows] = await db.query(query, params); // <<< This is where the data is fetched
        res.json(rows); // <<< This is where the data is sent to the frontend
    } catch (err) {
        console.error('Error fetching machines:', err);
        res.status(500).json({ message: 'Error fetching machines from database' });
    }
});
// Get machines by class ID
app.get('/api/machines', async (req, res) => {
    const { classId } = req.query;
    console.log(`GET /api/machines?classId=${classId} request received`);
    try {
        const [rows] = await db.query(
            'SELECT id, name, class_id AS classId, status, job_type AS jobType, job_started_at AS jobStartedAt, estimated_remaining_time_sec AS estimatedRemainingTimeSec, temperature, pressure, last_updated AS lastUpdated FROM machines WHERE class_id = ?',
            [classId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching machines by class:', err);
        res.status(500).json({ message: 'Error fetching machines from database' });
    }
});

// Get details for a single machine
app.get('/api/machines/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/machines/${id} request received`);
    try {
        // Fetch machine basic details
        const [machineRows] = await db.query(
            'SELECT id, name, class_id AS classId, status, job_type AS jobType, job_started_at AS jobStartedAt, estimated_remaining_time_sec AS estimatedRemainingTimeSec, temperature, pressure, last_updated AS lastUpdated, runtime_hours AS runtimeHours, idle_hours AS idleHours, productivity_score AS productivityScore FROM machines WHERE id = ?',
            [id]
        );

        if (machineRows.length === 0) {
            return res.status(404).json({ message: 'Machine not found' });
        }

        const machine = machineRows[0];

        // Fetch maintenance logs
        const [maintenanceLogsRows] = await db.query(
            'SELECT log_date AS date, description, performed_by AS performedBy FROM maintenance_logs WHERE machine_id = ? ORDER BY log_date DESC',
            [id]
        );
        machine.maintenanceLogs = maintenanceLogsRows;

        // Fetch failure history
        const [failureHistoryRows] = await db.query(
            'SELECT failure_date AS date, description, severity, action FROM failure_history WHERE machine_id = ? ORDER BY failure_date DESC',
            [id]
        );
        machine.failureHistory = failureHistoryRows;

        // For performanceData (charts), this is typically aggregated from historical events
        // For now, let's generate some simple mock data or use a placeholder,
        // as a real implementation would involve more complex aggregation queries over time-series data.
        machine.performanceData = {
            daily: [
                { name: '08:00', value: 10 }, { name: '09:00', value: 15 }, { name: '10:00', value: 12 },
                { name: '11:00', value: 18 }, { name: '12:00', value: 14 }, { name: '13:00', value: 20 },
                { name: '14:00', value: 16 }, { name: '15:00', value: 19 }
            ],
            weekly: [
                { name: 'Mon', value: 120 }, { name: 'Tue', value: 150 }, { name: 'Wed', value: 110 },
                { name: 'Thu', value: 130 }, { name: 'Fri', value: 160 }, { name: 'Sat', value: 70 },
                { name: 'Sun', value: 30 }
            ],
            monthly: [
                { name: 'Week 1', value: 700 }, { name: 'Week 2', value: 750 }, { name: 'Week 3', value: 680 }, { name: 'Week 4', value: 720 }
            ]
        };


        res.json(machine);
    } catch (err) {
        console.error(`Error fetching machine ${id} details:`, err);
        res.status(500).json({ message: 'Error fetching machine details from database' });
    }
});


// Get dashboard summary for a class
app.get('/api/dashboard-summary/:classId', async (req, res) => {
    const { classId } = req.params;
    console.log(`GET /api/dashboard-summary/${classId} request received`);
    try {
        const [summaryRows] = await db.query(
            `
            SELECT
                SUM(CASE WHEN status = 'Running' THEN 1 ELSE 0 END) as machinesOn,
                SUM(CASE WHEN status = 'Stopped' THEN 1 ELSE 0 END) as machinesOff,
                SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as underMaintenance,
                SUM(CASE WHEN status = 'Running' AND job_type IS NOT NULL THEN 1 ELSE 0 END) as currentDateJobsRunning
            FROM machines
            WHERE class_id = ?
            `,
            [classId]
        );

        const summary = summaryRows[0];

        // For `currentDateJobsCompleted` and `currentDateJobsPending`,
        // a real application would query job history or a job queue table.
        // For now, let's keep them as random mocks or simple placeholders.
        summary.currentDateJobsCompleted = Math.floor(Math.random() * 100);
        summary.currentDateJobsPending = Math.floor(Math.random() * 20);

        // For daily/weekly/monthly chart data in DashboardSummary,
        // these would typically be aggregated from historical data,
        // or fetched from a separate data warehousing/analytics service.
        // For now, we'll use the frontend's mock chart data.
        summary.dailyChartData = [
            { name: 'Job 1', value: 50, timeTaken: 120 },
            { name: 'Job 2', value: 30, timeTaken: 90 },
            { name: 'Job 3', value: 45, timeTaken: 150 },
            { name: 'Job 4', value: 60, timeTaken: 180 },
        ];
        summary.weeklyChartData = [
            { name: 'Mon', value: 120, runtimeHours: 80 },
            { name: 'Tue', value: 150, runtimeHours: 95 },
            { name: 'Wed', value: 110, runtimeHours: 70 },
            { name: 'Thu', value: 130, runtimeHours: 85 },
            { name: 'Fri', value: 160, runtimeHours: 100 },
            { name: 'Sat', value: 70, runtimeHours: 40 },
            { name: 'Sun', value: 30, runtimeHours: 20 },
        ];
        summary.monthlyChartData = [
            { name: 'Week 1', value: 700, runtimeHours: 400 },
            { name: 'Week 2', value: 750, runtimeHours: 420 },
            { name: 'Week 3', value: 680, runtimeHours: 380 },
            { name: 'Week 4', value: 720, runtimeHours: 410 },
        ];

        res.json(summary);
    } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        res.status(500).json({ message: 'Error fetching dashboard summary from database' });
    }
});

// Ensure PDFDocument and generateTable are properly imported/defined at the top of your server.js
// const PDFDocument = require('pdfkit');
// function generateTable(doc, data, columns, startY) { /* ... implementation ... */ }

// server.js (or your main Node.js server file)

// Make sure to require necessary libraries at the top (e.g., ExcelJS, PDFDocument, etc.)
//const PDFDocument = require('pdfkit');
// Assuming you have generateTable function defined elsewhere for PDF generation
// const generateTable = require('./utils/generateTable'); // Example if in a separate file
// For XLSX, if you're using it in another endpoint, ensure ExcelJS is required
// const ExcelJS = require('exceljs');

app.post('/api/reports/generate', async (req, res) => {
    const { type, startDate, endDate, format } = req.body;

    console.log('--- DEBUG: Report type received from frontend:', type);
    console.log('POST /api/reports/generate request received with config:', { type, startDate, endDate, format });

    try {
        let query = '';
        let params = [];
        let fetchedRows = []; // To store rows fetched directly from DB

        // --- Database Query Logic ---
        if (type === 'Machine Status') {
            // Validate dates for this report type
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Start date and End date are required for Machine Status report.' });
            }

            // Query for daily machine status from 'machine_daily_status' table
            query = `
                SELECT
                    id,
                    report_date,
                    machine_name,
                    shift_timing,
                    machine_status,
                    running_hrs,
                    idle_hrs,
                    CASE
                        WHEN (running_hrs + idle_hrs) = 0 THEN 0.00
                        ELSE (running_hrs / (running_hrs + idle_hrs)) * 100
                    END AS percentage,
                    no_of_files,
                    quantity,
                    weight
                FROM
                    machine_daily_status
                WHERE
                    report_date BETWEEN ? AND ? 
                ORDER BY
                    report_date ASC, id ASC
            `;
            params.push(startDate, endDate);

        } else if (type === 'Performance') {
            // Existing query for Performance from 'machines' table
            query = 'SELECT id, name, runtime_hours, idle_hours, productivity_score FROM machines';
            // No date filtering added here as per original, but can be if needed.
            // params remain empty for this query type if no filtering.
        } else {
            return res.status(400).json({ message: 'Invalid report type specified.' });
        }

        // --- Execute Database Query ---
        // Moved the query execution outside the if/else to avoid repetition and premature return.
        [fetchedRows] = await db.query(query, params);
        console.log("DEBUG: Raw fetchedRows from DB:", fetchedRows); // See what came from DB

        // If no data is found, return 404 (Not Found)
        if (fetchedRows.length === 0) {
            return res.status(404).json({ message: 'No data available for the selected report criteria.' });
        }

        // --- Data Processing/Formatting (Crucial for preventing undefined/toFixed errors) ---
        const processedData = fetchedRows.map(row => {
            const newRow = { ...row }; // Create a shallow copy

            // Helper function for robust numeric parsing and formatting
            const parseAndFormatNumber = (value, decimals = 2) => {
                const parsed = parseFloat(value);
                if (isNaN(parsed)) return 0.00;
                return parseFloat(parsed.toFixed(decimals)); // Convert back to number
            };
            // Helper function for robust integer parsing
            const parseAndFormatInt = (value) => {
                const parsed = parseInt(value);
                return isNaN(parsed) ? 0 : parsed;
            };

            if (type === 'Machine Status') {
                newRow.running_hrs = parseAndFormatNumber(row.running_hrs);
                newRow.idle_hrs = parseAndFormatNumber(row.idle_hrs);
                newRow.percentage = parseAndFormatNumber(row.percentage);
                newRow.no_of_files = parseAndFormatInt(row.no_of_files);
                newRow.quantity = parseAndFormatInt(row.quantity); // Assuming quantity is an integer
                newRow.weight = parseAndFormatNumber(row.weight);

                // Date formatting for report_date to ensure consistent YYYY-MM-DD
                if (row.report_date instanceof Date) {
                    // Use local date parts to construct the string to avoid timezone shifts
                    const year = row.report_date.getFullYear();
                    const month = (row.report_date.getMonth() + 1).toString().padStart(2, '0');
                    const day = row.report_date.getDate().toString().padStart(2, '0');
                    newRow.report_date = `${year}-${month}-${day}`;
                } else if (typeof row.report_date === 'string' && row.report_date.length >= 10) {
                    // If it's already a string, ensure it's just 'YYYY-MM-DD'
                    newRow.report_date = row.report_date.substring(0, 10);
                } else {
                    newRow.report_date = ''; // Default for invalid date
                }

            } else if (type === 'Performance') {
                newRow.runtime_hours = parseAndFormatNumber(row.runtime_hours);
                newRow.idle_hours = parseAndFormatNumber(row.idle_hours);
                newRow.productivity_score = parseAndFormatNumber(row.productivity_score);
            }
            return newRow;
        });

        // console.log("DEBUG: Final processedData for report:", data); // See processed data

        const data = processedData; // Use the processed data for report generation
        console.log("DEBUG: Final Data for report:", data);
        // --- Report Format Generation (PDF, CSV, JSON) ---
        if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="report_${type.replace(/\s/g, '_')}.pdf"`);

            doc.pipe(res);

            doc.fontSize(24).text(`${type} Report`, { align: 'center' });
            doc.moveDown();

            const startYForTable = doc.y;

            if (data.length === 0) { // Check for no data *after* processing, before generating table
                doc.fontSize(12).text('No data available for this report.', doc.page.margins.left, startYForTable);
                doc.end();
                return; // Ensure no more response is sent
            }

            if (type === 'Machine Status') {
                // Define columns for Machine Status report for PDFTable
                const columns = [
                    { label: 'ID', property: 'id', width: 40 },
                    { label: 'Date', property: 'report_date', width: 70 },
                    { label: 'Machine', property: 'machine_name', width: 80 },
                    { label: 'Shift', property: 'shift_timing', width: 70 },
                    { label: 'Status', property: 'machine_status', width: 70 },
                    { label: 'Run(hrs)', property: 'running_hrs', width: 60 },
                    { label: 'Idle(hrs)', property: 'idle_hrs', width: 60 },
                    { label: 'Util(%)', property: 'percentage', width: 50 },
                    { label: 'Files', property: 'no_of_files', width: 40 },
                    { label: 'Qty', property: 'quantity', width: 40 },
                    { label: 'Weight', property: 'weight', width: 40 },
                ];
                generateTable(doc, data, columns, startYForTable);

            } else if (type === 'Performance') {
                // Define columns for Performance report for PDFTable
                const columns = [
                    { label: 'ID', property: 'id', width: 80 },
                    { label: 'Name', property: 'name', width: 150 },
                    { label: 'Runtime (hrs)', property: 'runtime_hours', width: 100 },
                    { label: 'Idle (hrs)', property: 'idle_hours', width: 80 },
                    { label: 'Productivity (%)', property: 'productivity_score', width: 120 }
                ];
                generateTable(doc, data, columns, startYForTable);

            } else {
                doc.fontSize(12).text('No valid report type selected for PDF generation.', doc.page.margins.left, startYForTable);
            }

            doc.end(); // Finalize the PDF document

        } else if (format === 'csv') {
           // Inside your server.js, within the 'csv' format block:

res.setHeader('Content-Type', 'text/csv');
res.setHeader('Content-Disposition', `attachment; filename="report_${type.replace(/\s/g, '_')}.csv"`);

if (data.length === 0) {
    return res.send(''); // Send an empty CSV if no data
}

let displayHeaders = [];
let dataProperties = [];

if (type === 'Machine Status') {
    displayHeaders = [
        'ID', 'Report Date', 'Machine Name', 'Shift Timing', 'Machine Status',
        'Running Hrs', 'Idle Hrs', 'Percentage', 'No of Files', 'Quantity', 'Weight'
    ];
    dataProperties = [
        'id', 'report_date', 'machine_name', 'shift_timing', 'machine_status',
        'running_hrs', 'idle_hrs', 'percentage', 'no_of_files', 'quantity', 'weight'
    ];
} else if (type === 'Performance') {
    displayHeaders = ['ID', 'Name', 'Runtime Hours', 'Idle Hours', 'Productivity Score'];
    dataProperties = ['id', 'name', 'runtime_hours', 'idle_hours', 'productivity_score'];
} else {
    return res.status(400).send('Invalid report type for CSV generation.');
}

const header = displayHeaders.join(',');

const csvRows = data.map(row => {
    return dataProperties.map(key => {
        const value = row[key];
        let strValue = '';

        if (value === null || value === undefined) {
            strValue = '';
        } else {
            strValue = String(value);
        }

        if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    }).join(',');
});

const finalCsvContent = `${header}\n${csvRows.join('\n')}`;

// --- !!! ADD THIS DEBUG LOG !!! ---
console.log("DEBUG: Final CSV Content to be sent:");
console.log(finalCsvContent);
// --- !!! END DEBUG LOG !!! ---

res.send(finalCsvContent);
        } else if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="report_${type.replace(/\s/g, '_')}.json"`);
            res.json(data); // Send the processed data as JSON

        } else {
            res.status(400).json({ message: 'Unsupported report format' });
        }

    } catch (error) {
        console.error('Error generating report:', error);
        // Provide more detail in the 500 error for debugging
        res.status(500).json({ message: 'Failed to generate report due to an internal server error.', error: error.message });
    }
});
// --- NEW CRUD Endpoints for Machine Profiles ---

// POST /api/machines - Add a new machine
app.post('/api/machines', async (req, res) => {
    // Validate request body - IMPORTANT! Add more robust validation here.
    const { id, name, classId, status, jobType, temperature, pressure } = req.body;
    if (!id || !name || !classId || !status || temperature === undefined || pressure === undefined) {
        return res.status(400).json({ message: 'Missing required machine fields.' });
    }

    try {
        // You might want to generate the ID on the backend if not provided by frontend,
        // or check if ID already exists. Assuming ID is provided by frontend for now.
        const [result] = await db.query(
            'INSERT INTO machines (id, name, class_id, status, job_type, temperature, pressure, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [id, name, classId, status, jobType || null, temperature, pressure] // jobType can be null
        );
        res.status(201).json({ message: 'Machine added successfully', machineId: id });
    } catch (err) {
        console.error('Error adding new machine:', err);
        // Check for duplicate entry error if 'id' is primary key
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Machine with ID '${id}' already exists.` });
        }
        res.status(500).json({ message: 'Failed to add machine to database' });
    }
});

// PUT /api/machines/:id - Update an existing machine
app.put('/api/machines/:id', async (req, res) => {
    const { id } = req.params;
    // Extract fields that can be updated.
    // Ensure you don't update ID, or sensitive calculated fields directly.
    const { name, classId, status, jobType, temperature, pressure } = req.body;

    // Build update query dynamically based on provided fields
    let updates = [];
    let params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (classId !== undefined) { updates.push('class_id = ?'); params.push(classId); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    // jobType can be explicitly set to null
    if (jobType !== undefined) { updates.push('job_type = ?'); params.push(jobType || null); }
    if (temperature !== undefined) { updates.push('temperature = ?'); params.push(temperature); }
    if (pressure !== undefined) { updates.push('pressure = ?'); params.push(pressure); }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    updates.push('last_updated = NOW()'); // Always update last_updated timestamp

    params.push(id); // Add ID to the end for the WHERE clause

    try {
        const [result] = await db.query(
            `UPDATE machines SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Machine not found for update.' });
        }
        res.json({ message: `Machine ${id} updated successfully` });
    } catch (err) {
        console.error(`Error updating machine ${id}:`, err);
        res.status(500).json({ message: 'Failed to update machine in database' });
    }
});

// DELETE /api/machines/:id - Delete a machine
app.delete('/api/machines/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Consider deleting associated maintenance logs or failure history first
        // Or configure your database with ON DELETE CASCADE for foreign keys
        await db.query('DELETE FROM maintenance_logs WHERE machine_id = ?', [id]);
        await db.query('DELETE FROM failure_history WHERE machine_id = ?', [id]);

        const [result] = await db.query('DELETE FROM machines WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Machine not found for deletion.' });
        }
        res.json({ message: `Machine ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting machine ${id}:`, err);
        res.status(500).json({ message: 'Failed to delete machine from database' });
    }
});



// Configure Nodemailer transporter (add this after your db pool setup)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // Use this if you encounter issues with self-signed certs (e.g., local development), but prefer valid certs in production
    }
});
app.post('/api/reports/notify', async (req, res) => {
    const { type, startDate, endDate, recipientEmails } = req.body;
    console.log('POST /api/reports/notify request received:', { type, startDate, endDate, recipientEmails });

    try {
        let query;
        let params = [];
        let filename; // To use for attachment
        let subject; // Email subject
        let excelColumns = []; // Columns definition for ExcelJS

        // --- Database Query Logic ---
        if (type === 'Machine Status') {
            // Validate dates for this report type
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Start date and End date are required for Machine Status report.' });
            }

            query = `
                SELECT
                    id,
                    report_date,
                    machine_name,
                    shift_timing,
                    machine_status,
                    running_hrs,
                    idle_hrs,
                    CASE
                        WHEN (running_hrs + idle_hrs) = 0 THEN 0.00
                        ELSE (running_hrs / (running_hrs + idle_hrs)) * 100
                    END AS percentage,
                    no_of_files,
                    quantity,
                    weight
                FROM
                    machine_daily_status
                WHERE
                    report_date BETWEEN ? AND ?
                ORDER BY
                    report_date ASC, id ASC
            `;
            params.push(startDate, endDate);

            filename = `machine_status_report_${startDate}_to_${endDate}.xlsx`; // Dynamic filename
            subject = `Machine Status Report for ${startDate} to ${endDate}`;

            // Define columns for the Excel file for Machine Status
            excelColumns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Report Date', key: 'report_date', width: 15 },
                { header: 'Machine Name', key: 'machine_name', width: 20 },
                { header: 'Shift Timing', key: 'shift_timing', width: 15 },
                { header: 'Status', key: 'machine_status', width: 15 },
                { header: 'Running Hrs', key: 'running_hrs', width: 15, numFmt: '0.00' },
                { header: 'Idle Hrs', key: 'idle_hrs', width: 15, numFmt: '0.00' },
                { header: 'Utilization (%)', key: 'percentage', width: 18, numFmt: '0.00' },
                { header: 'No. of Files', key: 'no_of_files', width: 15 },
                { header: 'Quantity', key: 'quantity', width: 15, numFmt: '0.00' },
                { header: 'Weight', key: 'weight', width: 15, numFmt: '0.00' }
            ];

        } else if (type === 'Performance') {
            query = 'SELECT id, name, runtime_hours, idle_hours, productivity_score FROM machines';
            // For performance, if you need date filtering, you'd add it here,
            // potentially joining with machine_daily_status or summarizing.
            // For this example, we keep it simple as originally provided.

            filename = `performance_report.xlsx`;
            subject = 'Machine Performance Report';

            // Define columns for the Excel file for Performance
            excelColumns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Runtime (hrs)', key: 'runtime_hours', width: 18 },
                { header: 'Idle (hrs)', key: 'idle_hours', width: 15 },
                { header: 'Productivity (%)', key: 'productivity_score', width: 20 }
            ];
        } else {
            return res.status(400).json({ message: 'Unsupported report type for notification.' });
        }

        // Fetch the data from the database
        const [rows] = await db.query(query, params); // Use 'params' here
        const data = rows;
        console.log("DATA FROM DB DAILY STATUS" + data);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data available for the selected report type to send.' });
        }

        // --- Data Processing/Formatting for Excel ---
        const processedData = rows.map(row => {
            const newRow = { ...row };

            if (type === 'Machine Status') {
                // Ensure numeric values are formatted for Excel
                newRow.running_hrs = parseFloat(row.running_hrs) || 0.00;
                if (!isNaN(newRow.running_hrs)) {
                    newRow.running_hrs = parseFloat(newRow.running_hrs.toFixed(2));
                } else {
                    newRow.running_hrs = 0.00;
                }
                newRow.idle_hrs = parseFloat(row.idle_hrs) || 0.00;
                if (!isNaN(newRow.idle_hrs)) {
                    newRow.idle_hrs = parseFloat(newRow.idle_hrs.toFixed(2));
                } else {
                    newRow.idle_hrs = 0.00;
                }
                newRow.percentage = parseFloat(row.percentage) || 0.00;
                if (!isNaN(newRow.percentage)) {
                    newRow.percentage = parseFloat(newRow.percentage.toFixed(2));
                } else {
                    newRow.percentage = 0.00;
                }
                if (row.report_date instanceof Date) {
                    // Extract year, month, and day components using LOCAL methods
                    const year = row.report_date.getFullYear();
                    // Month is 0-indexed (0 for Jan, 11 for Dec), so add 1
                    const month = (row.report_date.getMonth() + 1).toString().padStart(2, '0');
                    const day = row.report_date.getDate().toString().padStart(2, '0');

                    // Construct the 'YYYY-MM-DD' string from local components
                    newRow.report_date = `${year}-${month}-${day}`;
                } else {
                    // Handle cases where row.report_date might not be a Date object (e.g., already a string)
                    newRow.report_date = row.report_date;
                }

                newRow.no_of_files = typeof row.no_of_files === 'number' && !isNaN(row.no_of_files)
                    ? parseInt(row.no_of_files)
                    : 0;

                newRow.weight = parseFloat(row.weight) || 0.00;
                if (!isNaN(newRow.weight)) {
                    newRow.weight = parseFloat(newRow.weight.toFixed(2));
                } else {
                    newRow.weight = 0.00;
                }

                // Format report_date for readability in Excel
                if (row.report_date instanceof Date) {
                    newRow.report_date = row.report_date.toISOString().split('T')[0]; // YYYY-MM-DD
                }

            } else if (type === 'Performance') {
                newRow.runtime_hours = typeof row.runtime_hours === 'number' && !isNaN(row.runtime_hours)
                    ? parseFloat(row.runtime_hours.toFixed(2))
                    : 0.00;
                newRow.idle_hours = typeof row.idle_hours === 'number' && !isNaN(row.idle_hours)
                    ? parseFloat(row.idle_hours.toFixed(2))
                    : 0.00;
                newRow.productivity_score = typeof row.productivity_score === 'number' && !isNaN(row.productivity_score)
                    ? parseFloat(row.productivity_score.toFixed(2))
                    : 0.00;
            }
            return newRow;
        });

        // --- Generate XLSX Content ---
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${type} Report`);

        // Set columns for the worksheet
        worksheet.columns = excelColumns;

        // Apply style to header row (first row)
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' } // Yellow color (ARGB format)
            };
            cell.font = {
                bold: true,
                color: { argb: 'FF000000' } // Black text color
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center' // Center align headers
            };
        });

        // Add data rows to the worksheet
        worksheet.addRows(processedData);

        // Optional: Apply alignment to data cells (e.g., center numeric columns)
        processedData.forEach((row, index) => {
            const excelRow = worksheet.getRow(index + 2); // Data starts from row 2
            excelRow.eachCell((cell) => {
                // Example: Center align numeric columns
                if (typeof cell.value === 'number') {
                    cell.alignment = { horizontal: 'center' };
                }
            });
        });


        // Write workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // --- Send Email with XLSX Attachment ---
        const mailOptions = {
            from: `"${process.env.EMAIL_USER_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
            to: recipientEmails.join(', '), // Comma-separated list of recipients
            subject: subject,
            text: `Please find the attached ${type} report generated on ${new Date().toLocaleString()}.`,
            attachments: [
                {
                    filename: filename,
                    content: buffer, // Use the buffer directly
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX MIME type
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        res.status(200).json({ message: 'Report sent successfully via email. ', data });

    } catch (error) {
        console.error('Error sending report via email:', error);
        res.status(500).json({ message: 'Failed to send report via email.', error: error.message });
    }
});


/*

// Helper function to calculate broadcast address from IP and netmask
function calculateBroadcastAddress(ip, netmask) {
    const ipParts = ip.split('.').map(Number);
    const netmaskParts = netmask.split('.').map(Number);

    if (ipParts.length !== 4 || netmaskParts.length !== 4) {
        console.warn('Invalid IP or netmask format:', ip, netmask);
        return null;
    }

    const broadcastParts = [];
    for (let i = 0; i < 4; i++) {
        broadcastParts[i] = ipParts[i] | (~netmaskParts[i] & 255);
    }
    return broadcastParts.join('.');
}

/**
 * Calculates the primary IPv4 broadcast address of the system.
 * It prioritizes non-internal IPv4 interfaces.
 * @returns {string|null} The broadcast address string or null if not found.
 */

/*
function calculatePrimaryBroadcastAddress() {
    const interfaces = os.networkInterfaces();
    for (const ifaceName in interfaces) {
        const iface = interfaces[ifaceName];
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                if (alias.broadcast) {
                    return alias.broadcast;
                } else if (alias.address && alias.netmask) {
                    // Calculate if broadcast is not directly provided (e.g., on Linux)
                    return calculateBroadcastAddress(alias.address, alias.netmask);
                }
            }
        }
    }
    return null; // No suitable interface found
}
*/


app.get('/api/discover-devices', async (req, res) => {
    const broadcastIp = req.query.broadcastIp || calculatePrimaryBroadcastAddress();
    const timeout = parseInt(req.query.timeout, 10) || DEFAULT_TIMEOUT;

    if (!broadcastIp) {
        return res.status(500).json({ success: false, message: 'Could not determine broadcast IP address.' });
    }

    try {
        // Call the imported discoverDeviceUDP function
        const discovered = await discoverDeviceUDP(broadcastIp, timeout);
        const parsedDevices = [];
        let newDevicesCount = 0;
        let updatedDevicesCount = 0;

        for (const device of discovered) {
            const parsedData = parseMachineStatusResponse(device.data);

            // Add IP and Port to parsed data for DB storage
            parsedData.ip_address = device.ip;
            parsedData.port = device.port;
            parsedData.raw_response = device.data; // Store raw response

            // Check if device already exists
            const [existingDevices] = await db.query('SELECT id FROM machine_discovery_status WHERE ip_address = ?', [device.ip]);

            if (existingDevices.length > 0) {
                // Update existing device
                await db.query(
                    'UPDATE machine_discovery_status SET port = ?, status = ?, running_time_minutes = ?, job_name = ?, balance_time_minutes = ?, filename = ?, raw_response = ?, last_seen = NOW() WHERE ip_address = ?',
                    [
                        parsedData.port,
                        parsedData.status,
                        parsedData.runningTime,
                        parsedData.jobName,
                        parsedData.balanceTime,
                        parsedData.filename,
                        parsedData.raw_response,
                        parsedData.ip_address,
                    ]
                );
                updatedDevicesCount++;
            } else {
                // Insert new device
                await db.query(
                    'INSERT INTO machine_discovery_status (ip_address, port, status, running_time_minutes, job_name, balance_time_minutes, filename, raw_response, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
                    [
                        parsedData.ip_address,
                        parsedData.port,
                        parsedData.status,
                        parsedData.runningTime,
                        parsedData.jobName,
                        parsedData.balanceTime,
                        parsedData.filename,
                        parsedData.raw_response,
                    ]
                );
                newDevicesCount++;
            }
            parsedDevices.push(parsedData); // Add to the list for response
        }

        let message = '';
        if (discovered.length === 0) {
            message = 'No devices found within timeout.';
        } else {
            message = `Found and updated ${updatedDevicesCount} device(s). Inserted ${newDevicesCount} new device(s).`;
        }

        res.json({ success: true, message: message, devices: parsedDevices });

    } catch (error) {
        console.error('Discovery error:', error);
        res.status(500).json({ success: false, message: `Failed to discover devices: ${error.message}` });
    }
});

// Simple health check or root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Machine Discovery Backend is running!' });
});

// Database connection check endpoint
app.get('/api/db-check', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        if (rows && rows[0] && rows[0].solution === 2) {
            res.status(200).json({ success: true, message: 'Database connected successfully.' });
        } else {
            res.status(500).json({ success: false, message: 'Database query returned unexpected result.' });
        }
    } catch (error) {
        console.error('Database connection check failed:', error);
        res.status(500).json({ success: false, message: `Database connection failed: ${error.message}` });
    }
});



// --- Export modules for Jest testing ---
export {
    app,
    db, // Assuming 'db' is correctly available here
   // calculatePrimaryBroadcastAddress,
   // discoverDeviceUDP,
   // parseMachineStatusResponse,
    DEFAULT_TIMEOUT,    // Export constants
    UDP_PORT,           // Export constants
    DISCOVERY_MESSAGE   // Export constants
};
// Start the server only if this file is run directly (not imported as a module for testing)
if (isMainModule) {
    db.getConnection()
        .then(() => {
            console.log('Successfully connected to the database pool.');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Failed to connect to the database:', err);
            process.exit(1); // Exit if DB connection fails
        });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('Received SIGINT. Closing database connection.');
        db.end()
            .then(() => {
                console.log('Database connection closed.');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error closing database connection:', err);
                process.exit(1);
            });
    });
}
/*
// New API endpoint for sending reports via email
// New API endpoint for sending reports via email
app.post('/api/reports/notify', async (req, res) => {
    const { type, startDate, endDate, recipientEmails } = req.body;
    console.log('POST /api/reports/notify request received:', { type, startDate, endDate, recipientEmails });

    try {
        let query;
        let params = [];
        let filename; // To use for attachment
        let subject; // Email subject

        if (type === 'Machine Status') {
            query = `
               SELECT
    id,
    report_date,
    machine_name,
    shift_timing,
    machine_status,
    running_hrs,
    idle_hrs,
    CASE
        WHEN (running_hrs + idle_hrs) = 0 THEN 0.00
        ELSE (running_hrs / (running_hrs + idle_hrs)) * 100
    END AS percentage,
    no_of_files,
    weight
FROM
    machine_daily_status
WHERE
    report_date BETWEEN '2025-07-10' AND '2025-07-10'
ORDER BY
    report_date ASC, id ASC
            `;
            params.push(startDate, endDate);

            filename = `machine_status_report.csv`;
            subject = 'Machine Status Report';
        } else if (type === 'Performance') {
            query = 'SELECT id, name, runtime_hours, idle_hours, productivity_score FROM machines';
            filename = `performance_report.csv`;
            subject = 'Machine Performance Report';
        } else {
            return res.status(400).json({ message: 'Unsupported report type for notification.' });
        }

        // Fetch the data (same logic as report generation)
        const [rows] = await db.query(query, []); // Assuming no date filtering needed here for simplicity
        const data = rows;
        console.log("DATA FROM DB DAILY STATUS" + data);
        if (data.length === 0) {
            return res.status(404).json({ message: 'No data available for the selected report type to send.' });
        }

        // Generate CSV content
        const header = Object.keys(data[0]).join(',');
        const csvRows = data.map(row => Object.values(row).join(','));
        const csvContent = `${header}\n${csvRows.join('\n')}`;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmails.join(', '), // Comma-separated list of recipients
            subject: subject,
            text: `Please find the attached ${type} report generated on ${new Date().toLocaleString()}.`,
            attachments: [
                {
                    filename: filename,
                    content: csvContent,
                    contentType: 'text/csv',
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        res.status(200).json({ message: 'Report sent successfully via email.' });

    } catch (error) {
        console.error('Error sending report via email:', error);
        res.status(500).json({ message: 'Failed to send report via email.' });
    }
});   */

/*

// --- API Routes ---










// Optional: A general API route for testing backend access
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Machine Monitor API!', status: 'running' });
});

// Endpoint to get overviews of all machine classes (for the top row of cards)
app.get('/api/machine-classes', (req, res) => {
    console.log('GET /api/machine-classes request received');
    // Simulate network delay
    setTimeout(() => {
        res.json(mockMachineClasses);
    }, 500);
});

// Endpoint to get all machines (or filtered by class if a classId is provided)
app.get('/api/machines', (req, res) => {
    const { classId } = req.query; // Get classId from query parameters (e.g., /api/machines?classId=class1)
    console.log(`GET /api/machines request received for classId: ${classId || 'all'}`);

    let filteredMachines = mockMachines;
    if (classId) {
        filteredMachines = mockMachines.filter(m => m.classId === classId);
    }
    // Simulate network delay
    setTimeout(() => {
        res.json(filteredMachines);
    }, 700);
});

// Endpoint to get dashboard summary for a specific class (for the side panel)
app.get('/api/dashboard-summary/:classId', (req, res) => {
    const { classId } = req.params;
    console.log(`GET /api/dashboard-summary/${classId} request received`);

    const machinesInClass = mockMachines.filter(m => m.classId === classId);

    const summary = {
        machinesOn: machinesInClass.filter(m => m.status === 'Running').length,
        machinesOff: machinesInClass.filter(m => m.status === 'Stopped').length,
        underMaintenance: machinesInClass.filter(m => m.status === 'Maintenance').length,
        currentDateJobsCompleted: Math.floor(Math.random() * 100), // Mock data
        currentDateJobsPending: Math.floor(Math.random() * 20),
        currentDateJobsRunning: machinesInClass.filter(m => m.status === 'Running' && m.jobType).length,
        dailyChartData: generateMockChartData('daily'),
        weeklyChartData: generateMockChartData('weekly'),
        monthlyChartData: generateMockChartData('monthly'),
    };
    // Simulate network delay
    setTimeout(() => {
        res.json(summary);
    }, 800);
});

// NEW ENDPOINT: Get details for a single machine
app.get('/api/machines/:id', (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/machines/${id} request received`);

    const machine = mockMachines.find(m => m.id === id);

    if (machine) {
        // Simulate network delay
        setTimeout(() => {
            res.json(machine);
        }, 500);
    } else {
        res.status(404).json({ message: 'Machine not found' });
    }
});

// Mock API endpoint for report generation
/*app.post('/api/reports/generate', (req, res) => {
    console.log('POST /api/reports/generate request received with config:', req.body);
    const { type, format, startDate, endDate } = req.body;

    // In a real application, you would generate a report based on the config
    // and serve the file. For this mock, we'll simulate a file.

    // Simulate a delay for report generation
    setTimeout(() => {
        let filename = `machine_report_${type}_${new Date().toISOString().split('T')[0]}`;
        let fileContent;
        let contentType;

        if (format === 'pdf') {
            contentType = 'application/pdf';
            filename += '.pdf';
            fileContent = `Mock PDF Content for ${type} Report (Start: ${startDate || 'N/A'}, End: ${endDate || 'N/A'})`;
            // For a real PDF, you'd use a library like 'pdfkit' or stream a generated PDF.
            // Sending simple text content as a mock for PDF type.
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(fileContent);
        } else if (format === 'csv') {
            contentType = 'text/csv';
            filename += '.csv';
            fileContent = "MachineID,Status,Temperature,Pressure\n";
            mockMachines.forEach(m => {
                fileContent += `${m.id},${m.status},${m.temperature},${m.pressure}\n`;
            });
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(fileContent);
        } else if (format === 'json') {
            contentType = 'application/json';
            filename += '.json';
            fileContent = JSON.stringify({
                reportType: type,
                format: format,
                startDate: startDate || 'N/A',
                endDate: endDate || 'N/A',
                data: mockMachines.filter(m => m.classId === 'class1'), // Example: just return class1 machines
                summaryCharts: {
                    daily: generateMockChartData('daily'),
                    weekly: generateMockChartData('weekly'),
                    monthly: generateMockChartData('monthly')
                }
            }, null, 2); // Pretty print JSON
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(fileContent);
        } else {
            res.status(400).send('Unsupported report format.');
        }
    }, 1500); // Simulate 1.5 second generation time
}); */   // OLD ONE 

/*
app.post('/api/reports/generate', async (req, res) => { // Added 'async' keyword here
    console.log('POST /api/reports/generate request received with config:', req.body);
    const { type, format, startDate, endDate } = req.body;

    // Simulate a delay for report generation
    await new Promise(resolve => setTimeout(resolve, 1500)); // Using await for clarity with the delay

   if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 50 }); // Set margins for better layout
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfBuffer = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="machine_report_${type}_${new Date().toISOString().split('T')[0]}.pdf"`);
            res.send(pdfBuffer);
        });

        // Report Header
        doc.fontSize(25).text(`Machine Monitor ${type} Report`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, { align: 'center' }); // Current location: India
        if (startDate) doc.text(`Start Date: ${startDate}`, { align: 'center' });
        if (endDate) doc.text(`End Date: ${endDate}`, { align: 'center' });
        doc.moveDown(2);

        // Define columns for the table
        const tableColumns = [
            { label: 'ID', property: 'id', width: 60 },
            { label: 'Name', property: 'name', width: 100 },
            { label: 'Status', property: 'status', width: 80 },
            { label: 'Job Type', property: 'jobType', width: 80 },
            { label: 'Temperature (°C)', property: 'temperature', width: 90 },
            { label: 'Pressure (PSI)', property: 'pressure', width: 70 },
            { label: 'Last Updated', property: 'lastUpdated', width: 100 }
        ];

        // Ensure `lastUpdated` is a readable string
        const formattedMachines = mockMachines.map(m => ({
            ...m,
            lastUpdated: new Date(m.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) // Format for India locale
        }));

        // Add table
        doc.fontSize(18).text('--- Machine Data Snapshot ---', { align: 'left' });
        doc.moveDown();
        generateTable(doc, formattedMachines, tableColumns, doc.y);

        doc.end();

    } else if (format === 'csv') {
        const filename = `machine_report_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        let fileContent = "MachineID,Name,Status,Temperature,Pressure,LastUpdated\n";
        mockMachines.forEach(m => {
            fileContent += `${m.id},"${m.name}",${m.status},${m.temperature},${m.pressure},${m.lastUpdated}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(fileContent);
    } else if (format === 'json') {
        const filename = `machine_report_${type}_${new Date().toISOString().split('T')[0]}.json`;
        const fileContent = JSON.stringify({
            reportType: type,
            format: format,
            startDate: startDate || 'N/A',
            endDate: endDate || 'N/A',
            data: mockMachines, // Sending all mock machines as example
            summaryCharts: {
                daily: generateMockChartData('daily'),
                weekly: generateMockChartData('weekly'),
                monthly: generateMockChartData('monthly')
            }
        }, null, 2); // Pretty print JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(fileContent);
    } else {
        res.status(400).send('Unsupported report format.');
    }
});
*/
// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Frontend should connect to: http://localhost:${PORT}/api`);
});