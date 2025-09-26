// src/components/ClassOverviewCard.tsx
import React from 'react';
import { MachineClassOverview } from '../types/MachineData';
import eleImg4 from '../assets/images/elegoo-4.jpg';
import eleImg3 from '../assets/images/elegoo-3.jpg';
import theOneImg from '../assets/images/theone.jpg';
import kaizerImg from '../assets/images/kaizer.jpg';
interface ClassOverviewCardProps {
  classOverview: MachineClassOverview;
  isSelected: boolean;
  onClick: (classId: string) => void;
}

const ClassOverviewCard: React.FC<ClassOverviewCardProps> = ({ classOverview, isSelected, onClick }) => {
  const { id, name, onCount, offCount, maintenanceCount, runningTimeProductionHours } = classOverview;
  // --- Map class IDs to image paths (moved here) ---
  const classImages: { [key: string]: string } = {
    'class1': eleImg4,
    'class2': eleImg3,
    'class3': theOneImg,
    'class4': kaizerImg,
    // Add more mappings if you have more classes
  };
  // --- END Map ---
  return (
    <div
      key={classOverview.id}
      className={`
        bg-white rounded-lg shadow-lg p-5 cursor-pointer transition-all duration-300 transform hover:scale-105
        ${isSelected ? 'border-4 border-blue-600 ring-2 ring-blue-300' : 'border border-gray-200'}
      `}
      onClick={() => onClick(id)}
    >
        {/* --- Image for the class card (moved here) --- */}
      {classImages[classOverview.id] && (
        <div className="mb-3 flex justify-center">
          <img
            src={classImages[classOverview.id]}
            alt={`${classOverview.name} icon`}
            className="h-16 w-16 object-contain" // Adjust size as needed
          />
        </div>
      )}
      {/* --- END Image --- */}
      <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{name}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
        <p className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>ON: <span className="font-semibold ml-1">{onCount}</span></p>
        <p className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>OFF: <span className="font-semibold ml-1">{offCount}</span></p>
        <p className="flex items-center col-span-2"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>M: <span className="font-semibold ml-1">{maintenanceCount}</span></p>
      </div>
      <p className="text-base text-blue-700 font-semibold mt-3 text-center">
        Running Time Production: {runningTimeProductionHours} Hrs
      </p>
    </div>
  );
};

export default ClassOverviewCard;