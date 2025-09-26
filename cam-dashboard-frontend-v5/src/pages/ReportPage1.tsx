// src/pages/ReportsPage.tsx
import React from 'react';
import ReportGenerator from '../components/ReportGenerator';

const ReportsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Machine Reports</h2>
      <p className="text-gray-600 mb-4">Generate various reports on CAM machine performance and events, and download them in your preferred format.</p>
      <ReportGenerator />
      {/* You can add a section here for a list of previously generated reports */}
      {/* <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Previous Reports</h3>
        <p className="text-gray-600">No previous reports found.</p>
      </div> */}
    </div>
  );
};

export default ReportsPage;