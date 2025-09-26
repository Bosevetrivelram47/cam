// src/pages/MachineFormPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMachineDetails, createMachine, updateMachine } from '../services/api';
import { MachineData } from '../types/MachineData';
import { toast } from 'react-hot-toast'; // For notifications

const initialFormData: Partial<MachineData> = {
  name: '',
  classId: 'class1', // Default value
  status: 'Stopped', // Default value
  jobType: '',
  temperature: 25,
  pressure: 100,
  // lastUpdated will be set by backend
  // runtimeHours, idleHours, productivityScore are often derived/calculated
};

const MachineFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get ID from URL if editing
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<MachineData>>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!id; // True if 'id' exists in URL params

  // Fetch machine data if in edit mode
  useEffect(() => {
    const fetchMachine = async () => {
      if (isEditing) {
        setLoading(true);
        setError(null);
        try {
          const machine = await getMachineDetails(id!); // ! asserts id is not undefined
          // Set form data, excluding properties that are auto-generated or not editable via form
          setFormData({
            name: machine.name,
            classId: machine.classId,
            status: machine.status,
            jobType: machine.jobType || '',
            temperature: machine.temperature,
            pressure: machine.pressure,
            // Do NOT include id, lastUpdated, runtimeHours, idleHours, productivityScore, logs, history, performanceData
          });
        } catch (err) {
          console.error('Error fetching machine for edit:', err);
          setError('Failed to load machine data for editing.');
          toast.error('Failed to load machine data!');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No loading needed for Add mode
        setFormData(initialFormData); // Reset form for new machine
      }
    };
    fetchMachine();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        await updateMachine(id!, formData);
        toast.success(`Machine "${formData.name}" updated successfully!`);
      } else {
        await createMachine(formData);
        toast.success(`Machine "${formData.name}" added successfully!`);
      }
      navigate('/machines-manage'); // Go back to the management list
    } catch (err: any) {
      console.error('Error saving machine:', err);
      setError(err.response?.data?.message || 'Failed to save machine. Please check your input.');
      toast.error('Failed to save machine!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading form...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow p-4 mb-6 flex items-center justify-between rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? `Edit Machine: ${formData.name || id}` : 'Add New Machine'}
        </h1>
        <button
          onClick={() => navigate('/machines-manage')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Management
        </button>
      </header>

      <main className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-2xl mx-auto">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEditing && ( // Only show ID field for Add mode if IDs are manually entered
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">Machine ID</label>
              <input
                type="text"
                name="id"
                id="id"
                required
                value={formData.id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Machine Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Machine Class</label>
            <select
              name="classId"
              id="classId"
              required
              value={formData.classId || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="class1">Elegoo-Sature-4</option>
              <option value="class2">Elegoo-Sature-3</option>
              <option value="class3">The One</option>
              <option value="class4">Kaizer</option>
              {/* Add more options as per your classes */}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              required
              value={formData.status || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Error">Error</option>
            </select>
          </div>

          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Current Job Type (Optional)</label>
            <input
              type="text"
              name="jobType"
              id="jobType"
              value={formData.jobType || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
            <input
              type="number"
              name="temperature"
              id="temperature"
              value={formData.temperature ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="pressure" className="block text-sm font-medium text-gray-700">Pressure (PSI)</label>
            <input
              type="number"
              name="pressure"
              id="pressure"
              value={formData.pressure ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/machines-manage')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : (isEditing ? 'Update Machine' : 'Add Machine')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default MachineFormPage;