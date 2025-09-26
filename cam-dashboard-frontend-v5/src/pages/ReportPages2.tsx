// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Select, MenuItem, TextField, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { generateReport, notifyReport } from '../services/api'; // Import notifyReport

const ReportsPage: React.FC = () => {
    const [reportType, setReportType] = useState<string>('Machine Status');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for recipient emails (you might add an input for this later)
    const [recipientEmails, setRecipientEmails] = useState<string[]>(['your_recipient_email@example.com']); // <<< CHANGE THIS to actual recipient emails

    // Function to handle report generation (existing)
    const handleGenerateReport = async (format: 'csv' | 'json' | 'pdf') => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await generateReport({ type: reportType, startDate, endDate, format });
            // For PDF/CSV, response is a blob, browser handles download
            // For JSON, response.data would be the JSON object
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${reportType.replace(/\s/g, '_')}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url); // Clean up the URL object

            setSuccessMessage(`Report (${format.toUpperCase()}) generated successfully!`);
        } catch (err: any) {
            console.error(`Error generating ${format} report:`, err);
            setError(err.response?.data?.message || `Failed to generate ${format} report.`);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 5000);
            setTimeout(() => setError(null), 5000);
        }
    };

    // NEW: Function to handle sending report via email
    const handleNotifyReport = async () => {
        if (recipientEmails.length === 0) {
            setError('Please enter at least one recipient email address.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await notifyReport({ type: reportType, startDate, endDate, recipientEmails });
            setSuccessMessage('Report successfully sent via email!');
        } catch (err: any) {
            console.error('Error sending report notification:', err);
            setError(err.response?.data?.message || 'Failed to send report via email.');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 5000);
            setTimeout(() => setError(null), 5000);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Reports
            </Typography>

            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value as string)}
                >
                    <MenuItem value="Machine Status">Machine Status</MenuItem>
                    <MenuItem value="Performance">Performance</MenuItem>
                </Select>
            </FormControl>

            {/* Date Range Filters (Optional, if your reports actually use them) */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button variant="contained" onClick={() => handleGenerateReport('csv')} disabled={loading}>
                    Generate CSV
                </Button>
                <Button variant="contained" onClick={() => handleGenerateReport('json')} disabled={loading}>
                    Generate JSON
                </Button>
                <Button variant="contained" onClick={() => handleGenerateReport('pdf')} disabled={loading}>
                    Generate PDF
                </Button>

                {/* NEW NOTIFY BUTTON */}
                <Button variant="contained" color="secondary" onClick={handleNotifyReport} disabled={loading}>
                    Notify (Send CSV by Email)
                </Button>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Generating/Sending Report...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default ReportsPage;