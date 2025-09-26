// src/components/DashboardSidePanel.tsx
import React, { useEffect, useState } from 'react';
import { DashboardSummary } from '../types/MachineData';
import { getDashboardSummaryForClass } from '../services/api';
import ChartComponent from './ChartComponent';
import { Cog8ToothIcon, PowerIcon, WrenchScrewdriverIcon, CheckCircleIcon, ExclamationCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

interface DashboardSidePanelProps {
  selectedClassId: string;
}

const DashboardSidePanel: React.FC<DashboardSidePanelProps> = ({ selectedClassId }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardSummaryForClass(selectedClassId);
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard summary.');
        console.error('Side Panel API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    // Optional: Refresh summary periodically if real-time data is critical
    const interval = setInterval(fetchSummary, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [selectedClassId]); // Re-fetch when selectedClassId changes

  if (loading) return <div className="p-6 text-center text-blue-600">Loading summary and charts...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!summary) return <div className="p-6 text-center text-gray-500">No summary data available.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Overall Status for {selectedClassId.replace('class', 'Class ')}
      </h3>

      {/* Machine Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
          <PowerIcon className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{summary.machinesOn}</p>
          <p className="text-sm text-gray-600">Machines ON</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
          <Cog8ToothIcon className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{summary.machinesOff}</p>
          <p className="text-sm text-gray-600">Machines OFF</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
          <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{summary.underMaintenance}</p>
          <p className="text-sm text-gray-600">Under Maintenance</p>
        </div>
      </div>

      {/* Current Day Job Overview */}
      <h4 className="text-xl font-bold text-gray-800 mb-4">Current Day Job Status ({new Date().toLocaleDateString()})</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow-sm">
          <CheckCircleIcon className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{summary.currentDateJobsCompleted}</p>
          <p className="text-sm text-gray-600">Jobs Completed</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg shadow-sm">
          <ExclamationCircleIcon className="w-8 h-8 text-orange-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{summary.currentDateJobsPending}</p>
          <p className="text-sm text-gray-600">Jobs Pending</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
          <PlayCircleIcon className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{summary.currentDateJobsRunning}</p>
          <p className="text-sm text-gray-600">Jobs Running</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        <ChartComponent
          title="Daily Job & Time Breakdown"
          data={summary.dailyChartData}
          type="daily"
        />
        <ChartComponent
          title="Weekly Jobs & Total Runtime"
          data={summary.weeklyChartData}
          type="weekly"
        />
        <ChartComponent
          title="Monthly Jobs & Total Runtime"
          data={summary.monthlyChartData}
          type="monthly"
        />
      </div>
    </div>
  );
};

export default DashboardSidePanel;