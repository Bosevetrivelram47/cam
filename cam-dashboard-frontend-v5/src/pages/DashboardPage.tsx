// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { getMachineClassOverviews, getMachinesByClass } from '../services/api';
import { MachineClassOverview, MachineData } from '../types/MachineData';
import ClassOverviewCard from '../components/ClassOverviewCard';
import MachineCard from '../components/MachineCard';
import DashboardSidePanel from '../components/DashboardSidePanel';

const DashboardPage: React.FC = () => {
  const [classOverviews, setClassOverviews] = useState<MachineClassOverview[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('class1'); // Default to Class 1
  const [machinesInSelectedClass, setMachinesInSelectedClass] = useState<MachineData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [errorClasses, setErrorClasses] = useState<string | null>(null);
  const [errorMachines, setErrorMachines] = useState<string | null>(null);

  // Fetch machine class overviews (top row)
  useEffect(() => {
    const fetchClassOverviews = async () => {
      setLoadingClasses(true);
      setErrorClasses(null);
      try {
        const data = await getMachineClassOverviews();
        setClassOverviews(data);
        // If no class is pre-selected, default to the first one found
        if (data.length > 0 && !selectedClassId) {
          setSelectedClassId(data[0].id);
        }
      } catch (err) {
        setErrorClasses('Failed to load machine class overviews.');
        console.error('Class Overview API Error:', err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClassOverviews();
  }, [selectedClassId]); // Re-run if selectedClassId changes (to update highlights)

  // Fetch machines for the selected class (bottom left section)
  useEffect(() => {
    if (selectedClassId) {
      const fetchMachines = async () => {
        setLoadingMachines(true);
        setErrorMachines(null);
        try {
          const data = await getMachinesByClass(selectedClassId);
          setMachinesInSelectedClass(data);
        } catch (err) {
          setErrorMachines(`Failed to load machines for ${selectedClassId}.`);
          console.error('Machines by Class API Error:', err);
        } finally {
          setLoadingMachines(false);
        }
      };
      fetchMachines();
    }
  }, [selectedClassId]); // Re-fetch machines whenever the selectedClassId changes

  if (loadingClasses) return <p className="text-center text-blue-600 text-lg mt-8">Loading dashboard...</p>;
  if (errorClasses) return <p className="text-center text-red-600 text-lg mt-8">Error: {errorClasses}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
       CAM MACHINE MONITORING DASHBOARD
      </h1>

      {/* Top Section: Class Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {classOverviews.map((classOverview) => (
          <ClassOverviewCard
            key={classOverview.id}
            classOverview={classOverview}
            isSelected={selectedClassId === classOverview.id}
            onClick={setSelectedClassId}
          />
        ))}
      </div>

      {/* Main Content Area: Machines in Selected Class & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Machines in Selected Class */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Machines in {selectedClassId.replace('class', 'Class ')}
          </h2>
          {loadingMachines ? (
            <p className="text-center text-blue-600 text-lg">Loading machines...</p>
          ) : errorMachines ? (
            <p className="text-center text-red-600 text-lg">Error: {errorMachines}</p>
          ) : machinesInSelectedClass.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No machines found for this class.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {machinesInSelectedClass.map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Dashboard Side Panel (Summary & Charts) */}
        <div className="lg:col-span-1">
          {selectedClassId && <DashboardSidePanel selectedClassId={selectedClassId} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;