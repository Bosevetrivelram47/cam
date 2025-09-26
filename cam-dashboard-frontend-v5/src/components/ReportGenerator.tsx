// src/components/ReportGenerator.tsx
import React, { useState } from 'react';
import { generateReport } from '../services/api';

const ReportGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily'); // e.g., 'daily', 'weekly', 'monthly', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('pdf'); // e.g., 'pdf', 'csv', 'json'

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const config = {
        type: reportType,
        format: format, // Include format in the config
        startDate: reportType === 'custom' && startDate ? startDate : undefined,
        endDate: reportType === 'custom' && endDate ? endDate : undefined,
      };

      const reportBlob = await generateReport(config);

      // Create a Blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([reportBlob]));
      const link = document.createElement('a');
      link.href = url;
      // Set filename based on report type and format
      link.setAttribute('download', `machine_report_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link); // Clean up the DOM element
      window.URL.revokeObjectURL(url); // Release the object URL

      alert('Report generated successfully and download initiated!');
    } catch (error) {
      alert('Failed to generate report. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 mt-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Generate Machine Report</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Report Type Selection */}
        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
            Report Type:
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Report Format Selection */}
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
            Format:
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        {/* Custom Date Range Inputs (conditionally rendered) */}
        {reportType === 'custom' && (
          <>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleGenerateReport}
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
  );
};

export default ReportGenerator;