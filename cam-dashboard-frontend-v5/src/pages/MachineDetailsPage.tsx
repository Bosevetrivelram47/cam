// src/pages/MachineDetailsPage.tsx

// src/pages/MachineDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { getMachineDetails } from '../services/api'; // Assuming you have this API call
import { MachineData, MaintenanceLog, FailureLog } from '../types/MachineData'; // Adjust path if necessary
import { ArrowLeftIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // Example icons
import { Bar, BarChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Helper function for formatting (can be in utils or here)
const formatTimeRemaining = (seconds: number | undefined): string => {
  if (seconds === undefined || seconds <= 0) return 'Job Complete / N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
};

const MachineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // <--- Get the 'id' from the URL
  const navigate = useNavigate(); // For going back

  const [machineDetails, setMachineDetails] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachineData = async () => {
      if (!id) {
        setError("Machine ID not found in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getMachineDetails(id);
        setMachineDetails(data);
      } catch (err) {
        console.error("Failed to fetch machine details:", err);
        setError("Failed to load machine details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMachineData();
  }, [id]); // Re-fetch if ID changes (though usually it won't on this page)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-gray-600 text-lg">Loading machine details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-red-600 text-lg bg-red-100 p-4 rounded-md">Error: {error}</div>
        <button
          onClick={() => navigate('/')}
          className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!machineDetails) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-gray-600 text-lg">No machine details found.</div>
        <button
          onClick={() => navigate('/')}
          className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Render the machine details if data is available
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow p-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Details for {machineDetails.name} (ID: {machineDetails.id})
        </h1>
        <div></div> {/* Placeholder for right alignment */}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Overview Card */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Machine Overview</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">Name:</span> {machineDetails.name}</p>
            <p><span className="font-medium">Class:</span> {machineDetails.classId}</p>
            <p><span className="font-medium">Status:</span> <span className={`font-semibold ${machineDetails.status === 'Running' ? 'text-green-600' : machineDetails.status === 'Stopped' ? 'text-red-600' : 'text-yellow-600'}`}>{machineDetails.status}</span></p>
            <p><span className="font-medium">Current Job:</span> {machineDetails.jobType || 'N/A'}</p>
            <p><span className="font-medium">Time Left:</span> {formatTimeRemaining(machineDetails.estimatedRemainingTimeSec)}</p>
            <p><span className="font-medium">Temperature:</span> {machineDetails.temperature}°C</p>
            <p><span className="font-medium">Pressure:</span> {machineDetails.pressure} PSI</p>
            <p><span className="font-medium">Last Updated:</span> {machineDetails.lastUpdated ? new Date(machineDetails.lastUpdated).toLocaleString() : 'N/A'}</p>
            <p><span className="font-medium">Runtime:</span> {machineDetails.runtimeHours} hrs</p>
            <p><span className="font-medium">Idle Time:</span> {machineDetails.idleHours} hrs</p>
            <p><span className="font-medium">Productivity Score:</span> {machineDetails.productivityScore}%</p>
          </div>
        </div>

        {/* Maintenance Logs */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <WrenchScrewdriverIcon className="h-6 w-6 mr-2 text-blue-600" />
            Maintenance Logs
          </h2>
          {machineDetails.maintenanceLogs && machineDetails.maintenanceLogs.length > 0 ? (
            <div className="space-y-4">
              {machineDetails.maintenanceLogs.map((log, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-800">{new Date(log.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-700">{log.description}</p>
                  <p className="text-xs text-gray-500">Performed by: {log.performedBy}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No maintenance logs available.</p>
          )}
        </div>

        {/* Failure History */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
            Failure History
          </h2>
          {machineDetails.failureHistory && machineDetails.failureHistory.length > 0 ? (
            <div className="space-y-4">
              {machineDetails.failureHistory.map((failure, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-800">{new Date(failure.date).toLocaleString()}</p>
                  <p className="text-sm text-gray-700">Severity: <span className={`font-semibold ${failure.severity === 'High' ? 'text-red-500' : failure.severity === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>{failure.severity}</span></p>
                  <p className="text-sm text-gray-700">Description: {failure.description}</p>
                  <p className="text-xs text-gray-500">Action Taken: {failure.action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No failure history available.</p>
          )}
        </div>

        {/* Performance Charts (Using mock data for now as per backend) */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-green-600" />
            Performance Trends
          </h2>
          {machineDetails.performanceData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Daily Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={machineDetails.performanceData.daily}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={machineDetails.performanceData.weekly}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={machineDetails.performanceData.monthly}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No performance data available.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default MachineDetailsPage;


/*
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMachineDetails } from '../services/api';
import { MachineData, ChartDataItem, MaintenanceLog, FailureLog } from '../types/MachineData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'; // Assuming recharts is installed
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; // Assuming you have Heroicons installed

const MachineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        setError('Machine ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getMachineDetails(id);
        setMachine(data);
      } catch (err) {
        console.error('Failed to fetch machine details:', err);
        setError('Failed to load machine details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading machine details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }

  if (!machine) {
    return <div className="flex justify-center items-center h-screen text-gray-600 text-lg">Machine not found.</div>;
  }

  // Helper to format duration from seconds to HH:MM:SS
  const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined || seconds < 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 ml-4">{machine.name} Details</h1>
        </div>

        {/* Machine Overview */
        /* starting of another comment
      }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DetailCard title="Current Status" value={machine.status} />
          <DetailCard title="Job Name" value={machine.jobType || 'N/A'} />
          <DetailCard title="Job Started At" value={machine.jobStartedAt ? new Date(machine.jobStartedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'} />
          <DetailCard title="Balance Timing" value={formatDuration(machine.estimatedRemainingTimeSec)} />
          <DetailCard title="Temperature" value={`${machine.temperature}°C`} />
          <DetailCard title="Pressure" value={`${machine.pressure} PSI`} />
          <DetailCard title="Last Updated" value={new Date(machine.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} />
          <DetailCard title="Total Runtime" value={`${machine.runtimeHours?.toFixed(1) || 'N/A'} hrs`} />
          <DetailCard title="Total Idle Time" value={`${machine.idleHours?.toFixed(1) || 'N/A'} hrs`} />
          <DetailCard title="Productivity Score" value={`${machine.productivityScore?.toFixed(0) || 'N/A'}%`} />
        </div>
*/
        {/* Performance Charts */}
        /*
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {machine.performanceData?.daily && machine.performanceData.daily.length > 0 && (
            <ChartCard title="Daily Performance (Jobs)">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={machine.performanceData.daily} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Jobs Completed" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {machine.performanceData?.weekly && machine.performanceData.weekly.length > 0 && (
            <ChartCard title="Weekly Performance (Total Jobs)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={machine.performanceData.weekly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Total Jobs" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {machine.performanceData?.monthly && machine.performanceData.monthly.length > 0 && (
            <ChartCard title="Monthly Performance (Total Jobs)">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={machine.performanceData.monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#ffc658" name="Total Jobs" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>

        */
        {/* Maintenance Logs */}

        /*
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Maintenance History</h2>
        <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-8">
          {machine.maintenanceLogs && machine.maintenanceLogs.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {machine.maintenanceLogs.map((log, index) => (
                <li key={index} className="text-gray-700">
                  <span className="font-semibold">{new Date(log.date).toLocaleDateString('en-IN')}:</span> {log.description} (Performed by: {log.performedBy})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent maintenance logs.</p>
          )}
        </div>
*/
        {/* Failure History */}
        /*
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Failure History</h2>
        <div className="bg-gray-50 p-4 rounded-md shadow-inner">
          {machine.failureHistory && machine.failureHistory.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {machine.failureHistory.map((log, index) => (
                <li key={index} className="text-gray-700">
                  <span className={`font-semibold ${log.severity === 'High' ? 'text-red-600' : log.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {new Date(log.date).toLocaleDateString('en-IN')} [{log.severity}]:
                  </span> {log.description} (Action: {log.action})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recorded failure history.</p>
          )}
        </div>

      </div>
    </div>
  );
};

// Reusable Detail Card Component
interface DetailCardProps {
  title: string;
  value: string | number;
}
const DetailCard: React.FC<DetailCardProps> = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-xl font-semibold text-gray-900">{value}</p>
  </div>
);

// Reusable Chart Card Component
interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}
const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
        {children}
    </div>
);


export default MachineDetailsPage;

*/