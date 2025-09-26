// src/components/NavBar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
 ArrowRightStartOnRectangleIcon,
 WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

// No separate CSS file needed if using only Tailwind, but if you have custom CSS:
// import '../styles/NavBar.css';

interface NavBarProps {
  onLogout: () => void; // Define the prop type
}

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center shadow-md">
      <div className="font-bold text-xl">CAM DASHBOARD</div>
      <ul className="flex space-x-6">


 <li>
    <NavLink
      to="/dashboard"
      end
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 ${
          isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
        }`
      }
    >
      <HomeIcon className="w-5 h-5" />
      <span>Dashboard</span>
    </NavLink>
  </li>

<li>
    <NavLink
      to="/machines-manage"
      end
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 ${
          isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
        }`
      }
    >
      <WrenchScrewdriverIcon className="w-5 h-5" />
      <span>Machines</span>
    </NavLink>
  </li>


  
  <li>
    <NavLink
      to="/reports"
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 ${
          isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
        }`
      }
    >
      <DocumentChartBarIcon className="w-5 h-5" />
      <span>Reports</span>
    </NavLink>
  </li>
   <li>
    <NavLink
      to="/discovery-dashboard"
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 ${
          isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
        }`
      }
    >
      <Cog6ToothIcon className="w-5 h-5" />
      <span>Live</span>
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/settings"
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 ${
          isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
        }`
      }
    >
      <Cog6ToothIcon className="w-5 h-5" />
      <span>Settings</span>
    </NavLink>
  </li>
  <li>
    <button
      onClick={onLogout}
      className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 shadow"
    >
      <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
      <span>Logout</span>
    </button>
  </li>



       {/*  <li>
          <NavLink
            to="/dashboard"
            end // Ensures this is active only when path is exactly "/" or "/dashboard"
            className={({ isActive }) =>
              `hover:text-blue-300 transition-colors duration-200 ${isActive ? 'text-blue-400 font-semibold' : ''}`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `hover:text-blue-300 transition-colors duration-200 ${isActive ? 'text-blue-400 font-semibold' : ''}`
            }
          >
            Reports
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `hover:text-blue-300 transition-colors duration-200 ${isActive ? 'text-blue-400 font-semibold' : ''}`
            }
          >
            Settings
          </NavLink>
        </li>
        <li>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            Logout
          </button>
        </li> */}
      </ul>
    </nav>
  );
};

export default NavBar;