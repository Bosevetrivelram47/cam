// src/pages/ReportsPage.tsx
import React, { useState } from 'react';
import { Button, Box, Typography, Select, MenuItem, TextField, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { generateReport, notifyReport } from '../services/api';

const ReportsPage: React.FC = () => {
    const [reportType, setReportType] = useState<string>('Machine Status');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for the email input field (as a string)
    const [emailInput, setEmailInput] = useState<string>('sundaramurthys@bitsathy.ac.in'); // Initial email

    // Derived state for recipientEmails array, based on emailInput
    const actualRecipientEmails = emailInput.split(',').map(email => email.trim()).filter(email => email !== '');

    const handleGenerateReport = async (format: 'csv' | 'json' | 'pdf') => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
       try {
        // generateReport should return the Blob directly on success
        const blobData = await generateReport({ type: reportType, startDate, endDate, format });

        // IMPORTANT: Check if blobData is actually a Blob before creating URL
        if (!(blobData instanceof Blob)) {
            console.error("Received data is not a Blob:", blobData);
            throw new Error("Invalid data received from server for report generation.");
        }

        if (blobData.size === 0) {
            // Handle cases where the server sends an empty blob (e.g., for no data)
            // This is safer than trying to createObjectURL with an empty blob that might confuse some browsers
            console.warn("Received empty blob for report. No data available?");
            setSuccessMessage(`No data found for the selected criteria to generate ${format.toUpperCase()} report.`);
            return; // Exit function if no data
        }


        const url = window.URL.createObjectURL(blobData); // Use blobData directly
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${reportType.replace(/\s/g, '_')}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccessMessage(`Report (${format.toUpperCase()}) generated successfully!`);

    } catch (err: any) {
        console.error(`Error generating ${format} report:`, err);

        let errorMessage = `Failed to generate ${format} report.`;

        // Check if the error is an AxiosError with a response from the server
        if (err.response) {
            // Attempt to read the error message from the response data if it's a blob
            // This is for cases where the server sent a JSON error but responseType was blob
            if (err.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorJson = JSON.parse(reader.result as string);
                        errorMessage = errorJson.message || errorMessage;
                    } catch (e) {
                        console.error("Could not parse error blob as JSON:", e);
                    }
                    setError(errorMessage); // Set error message after reading blob
                };
                reader.onerror = () => {
                    console.error("Failed to read error blob:", reader.error);
                    setError(errorMessage);
                };
                reader.readAsText(err.response.data); // Read the blob as text
                // Return here to wait for FileReader to complete and set the error
                return;
            } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                // If Axios parsed it as JSON directly (less common with responseType: 'blob')
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message; // Generic Axios message
            }
        }

        setError(errorMessage); // Set the error message
    } finally {
        setLoading(false);
        setTimeout(() => setSuccessMessage(null), 5000);
        setTimeout(() => setError(null), 5000);
    }
    }; 

    const handleNotifyReport = async () => {
        if (actualRecipientEmails.length === 0) {
            setError('Please enter at least one recipient email address.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            // Use actualRecipientEmails here
            await notifyReport({ type: reportType, startDate, endDate, recipientEmails: actualRecipientEmails });
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

            {/* NEW: Email Input Field */}
            <TextField
                label="Recipient Emails (comma-separated)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
                helperText="Enter multiple emails separated by commas (e.g., email1@example.com, email2@domain.com)"
            />

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