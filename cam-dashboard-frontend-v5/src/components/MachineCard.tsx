// src/components/MachineCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // IMPORT useNavigate
import { MachineData } from '../types/MachineData'; // Adjust path if necessary
import { PlayIcon, StopIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // Adjust icons if needed

interface MachineCardProps {
  machine: MachineData;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const formatTimeRemaining = (seconds: number | undefined): string => {
    if (seconds === undefined || seconds <= 0) return 'Job Complete / N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'text-green-600 bg-green-100';
      case 'Stopped': return 'text-red-600 bg-red-100';
      case 'Maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'Error': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running': return <PlayIcon className="h-5 w-5" />;
      case 'Stopped': return <StopIcon className="h-5 w-5" />;
      case 'Maintenance': return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'Error': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <QuestionMarkCircleIcon className="h-5 w-5" />;
    }
  };

  return (
    <div key={machine.id} className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800">{machine.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
          <div className="flex items-center">
            {getStatusIcon(machine.status)}
            <span className="ml-1">{machine.status}</span>
          </div>
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">ID: {machine.id}</p>
      <p className="text-sm text-gray-600 mb-1">Job: {machine.jobType || 'N/A'}</p>
      <p className="text-sm text-gray-600 mb-1">Time Left: {formatTimeRemaining(machine.estimatedRemainingTimeSec)}</p>
      <p className="text-sm text-gray-600 mb-1">Temp: {machine.temperature}°C</p>
      <p className="text-sm text-gray-600">Pressure: {machine.pressure} PSI</p>
      <div className="mt-auto pt-3 border-t border-gray-200 text-right">
        <button
          onClick={() => navigate(`/machine/${machine.id}`)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default MachineCard;