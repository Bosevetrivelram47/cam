// src/pages/MachineManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMachines, deleteMachine } from '../services/api';
import { MachineData } from '../types/MachineData';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast'; // For notifications

const MachineManagementPage: React.FC = () => {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMachines = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMachines();
      setMachines(data);
    } catch (err) {
      console.error('Error fetching all machines:', err);
      setError('Failed to load machines.');
      toast.error('Failed to load machines!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete machine "${name}" (ID: ${id})? This action cannot be undone.`)) {
      try {
        await deleteMachine(id);
        toast.success(`Machine "${name}" deleted successfully!`);
        fetchMachines(); // Re-fetch machines after deletion
      } catch (err) {
        console.error(`Error deleting machine ${id}:`, err);
        toast.error(`Failed to delete machine "${name}".`);
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading machines...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow p-4 mb-6 flex items-center justify-between rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">Machine Profiles Management</h1>
        <button
          onClick={() => navigate('/machines-manage/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Machine
        </button>
      </header>

      <main className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {machines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No machines found. Click "Add New Machine" to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pressure (PSI)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {machines.map((machine) => (
                  <tr key={machine.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/machine/${machine.id}`)}>
                      {machine.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.classId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.temperature ?? 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.pressure ?? 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.lastUpdated ? new Date(machine.lastUpdated).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/machines-manage/${machine.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(machine.id, machine.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default MachineManagementPage;