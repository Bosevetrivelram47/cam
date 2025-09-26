// src/services/api.ts
import axios from 'axios';
import { MachineData, MachineClassOverview, DashboardSummary, ChartDataItem } from '../types/MachineData';

// Set your backend API base URL from the .env file
// Ensure your .env.local or .env file in the frontend has VITE_API_URL=http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// IMPORTANT: Add this request interceptor for cache busting during development
// This appends a unique timestamp to GET requests to force fresh data,
// bypassing browser/server caching (e.g., 304 Not Modified issues).
api.interceptors.request.use(config => {
  if (config.method === 'get') {
    // Ensure params object exists
    config.params = config.params || {};
    // Add a unique timestamp parameter
    config.params._t = Date.now();
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- MOCK DATA FOR DEVELOPMENT (REMOVE/REPLACE WITH REAL BACKEND CALLS IN PRODUCTION) ---
// This mock data is used by the frontend when the backend is not fully integrated or for development.
// In a real application, these would be fetched directly from the backend.

const mockMachines: MachineData[] = [
  // Class 1 Machines
    {
        id: 'M001',
        name: 'Elegoo-Saturn-4-001',
        classId: 'class1',
        status: 'Running',
        jobType: 'Milling',
        jobStartedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        estimatedRemainingTimeSec: 1800,
        temperature: 78,
        pressure: 5.2,
        lastUpdated: new Date().toISOString(),
        runtimeHours: 150.5,
        idleHours: 25.1,
        productivityScore: 92, // Percentage or score
        maintenanceLogs: [
            { date: '2025-05-10', description: 'Lubrication and calibration', performedBy: 'Technician A' },
            { date: '2025-03-15', description: 'Motor inspection', performedBy: 'Technician B' }
        ],
        failureHistory: [
            { date: '2025-06-01', description: 'Spindle motor overheat', severity: 'High', action: 'Replaced cooling fan' },
            { date: '2024-11-20', description: 'Tool changer jam', severity: 'Medium', action: 'Adjusted mechanism' }
        ],
        // Mock data for machine-specific charts
        performanceData: {
            daily: [
                { name: '08:00', value: 10 }, { name: '09:00', value: 15 }, { name: '10:00', value: 12 },
                { name: '11:00', value: 18 }, { name: '12:00', value: 14 }, { name: '13:00', value: 20 },
                { name: '14:00', value: 16 }, { name: '15:00', value: 19 }
            ], // e.g., jobs completed per hour
            weekly: [
                { name: 'Mon', value: 120 }, { name: 'Tue', value: 150 }, { name: 'Wed', value: 110 },
                { name: 'Thu', value: 130 }, { name: 'Fri', value: 160 }, { name: 'Sat', value: 70 },
                { name: 'Sun', value: 30 }
            ], // e.g., total jobs per day
            monthly: [
                { name: 'Week 1', value: 700 }, { name: 'Week 2', value: 750 }, { name: 'Week 3', value: 680 }, { name: 'Week 4', value: 720 }
            ] // e.g., total jobs per week
        }
    },
    { id: 'M002', name: 'Elegoo-Saturn-4-002', classId: 'class1', status: 'Maintenance', temperature: 40, pressure: 0.5, lastUpdated: new Date(Date.now() - 60 * 1000).toISOString(), runtimeHours: 100.2, idleHours: 50.8, productivityScore: 85, maintenanceLogs: [{ date: '2025-06-25', description: 'Scheduled annual maintenance', performedBy: 'Technician C' }], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M003', name: 'Elegoo-Saturn-4-003', classId: 'class1', status: 'Running', jobType: 'Drilling', jobStartedAt: new Date(Date.now() - 1200 * 1000).toISOString(), estimatedRemainingTimeSec: 600, temperature: 72, pressure: 4.8, lastUpdated: new Date().toISOString(), runtimeHours: 200.0, idleHours: 10.0, productivityScore: 95, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M004', name: 'Elegoo-Saturn-4-004', classId: 'class1', status: 'Stopped', temperature: 25, pressure: 0.1, lastUpdated: new Date(Date.now() - 300 * 1000).toISOString(), runtimeHours: 80.0, idleHours: 70.0, productivityScore: 70, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M005', name: 'Elegoo-Saturn-4-005', classId: 'class1', status: 'Running', jobType: 'Turning', jobStartedAt: new Date(Date.now() - 7200 * 1000).toISOString(), estimatedRemainingTimeSec: 3600, temperature: 80, pressure: 5.5, lastUpdated: new Date().toISOString(), runtimeHours: 180.0, idleHours: 30.0, productivityScore: 90, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },

    // Class 2 Machines (Simplified for brevity, but can be expanded similarly)
    { id: 'M006', name: 'Elegoo-Saturn-3-001', classId: 'class2', status: 'Running', jobType: 'Engraving', jobStartedAt: new Date(Date.now() - 1800 * 1000).toISOString(), estimatedRemainingTimeSec: 900, temperature: 65, pressure: 3.1, lastUpdated: new Date().toISOString(), runtimeHours: 120.0, idleHours: 15.0, productivityScore: 88, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M007', name: 'Elegoo-Saturn-3-002', classId: 'class2', status: 'Running', jobType: 'Cutting', jobStartedAt: new Date(Date.now() - 5400 * 1000).toISOString(), estimatedRemainingTimeSec: 2700, temperature: 70, pressure: 3.5, lastUpdated: new Date().toISOString(), runtimeHours: 90.0, idleHours: 20.0, productivityScore: 82, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M008', name: 'Elegoo-Saturn-3-003', classId: 'class2', status: 'Stopped', temperature: 28, pressure: 0.2, lastUpdated: new Date(Date.now() - 10000).toISOString(), runtimeHours: 50.0, idleHours: 30.0, productivityScore: 65, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M009', name: 'Elegoo-Saturn-3-004', classId: 'class2', status: 'Maintenance', temperature: 35, pressure: 0.3, lastUpdated: new Date(Date.now() - 20000).toISOString(), runtimeHours: 70.0, idleHours: 40.0, productivityScore: 75, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },

    // Class 3 Machines
    { id: 'M010', name: 'The-One-001', classId: 'class3', status: 'Running', jobType: 'Assembly', jobStartedAt: new Date(Date.now() - 900 * 1000).toISOString(), estimatedRemainingTimeSec: 450, temperature: 55, pressure: 1.2, lastUpdated: new Date().toISOString(), runtimeHours: 110.0, idleHours: 10.0, productivityScore: 90, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M011', name: 'The-One-002', classId: 'class3', status: 'Stopped', temperature: 20, pressure: 0.0, lastUpdated: new Date(Date.now() - 5000).toISOString(), runtimeHours: 60.0, idleHours: 50.0, productivityScore: 60, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M012', name: 'The-One-003', classId: 'class3', status: 'Running', jobType: 'Packaging', jobStartedAt: new Date(Date.now() - 2700 * 1000).toISOString(), estimatedRemainingTimeSec: 1350, temperature: 60, pressure: 2.0, lastUpdated: new Date().toISOString(), runtimeHours: 130.0, idleHours: 5.0, productivityScore: 98, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },

    // Class 4 Machines
    { id: 'M013', name: 'Kaizer-001', classId: 'class4', status: 'Running', temperature: 22, pressure: 0.1, lastUpdated: new Date().toISOString(), runtimeHours: 20.0, idleHours: 2.0, productivityScore: 99, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M014', name: 'Kaizer-002', classId: 'class4', status: 'Running', temperature: 28, pressure: 0.0, lastUpdated: new Date().toISOString(), runtimeHours: 30.0, idleHours: 1.0, productivityScore: 99, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
    { id: 'M015', name: 'Kaizer-003', classId: 'class4', status: 'Maintenance', temperature: 30, pressure: 0.0, lastUpdated: new Date(Date.now() - 15000).toISOString(), runtimeHours: 10.0, idleHours: 5.0, productivityScore: 80, maintenanceLogs: [], failureHistory: [], performanceData: { daily: [], weekly: [], monthly: [] } },
];


const mockMachineClasses: MachineClassOverview[] = [
  { id: 'class1', name: 'Class 1 (Elegoo-Saturn-4)', onCount: 3, offCount: 1, maintenanceCount: 1, runningTimeProductionHours: 1600 },
    { id: 'class2', name: 'Class 2 (Elegoo-Saturn-3 )', onCount: 2, offCount: 1, maintenanceCount: 1, runningTimeProductionHours: 800 },
    { id: 'class3', name: 'Class 3 (The-One)', onCount: 2, offCount: 1, maintenanceCount: 0, runningTimeProductionHours: 1200 },
    { id: 'class4', name: 'Class 4 (Kaizer)', onCount: 2, offCount: 0, maintenanceCount: 1, runningTimeProductionHours: 400 },
];

const generateMockChartData = (type: 'daily' | 'weekly' | 'monthly'): ChartDataItem[] => {
  if (type === 'daily') {
    return [
      { name: 'Job 1', value: 50, timeTaken: 120 }, // 50 jobs, 120 mins
      { name: 'Job 2', value: 30, timeTaken: 90 },
      { name: 'Job 3', value: 45, timeTaken: 150 },
      { name: 'Job 4', value: 60, timeTaken: 180 },
    ];
  } else if (type === 'weekly') {
    return [
      { name: 'Mon', value: 120, runtimeHours: 80 },
      { name: 'Tue', value: 150, runtimeHours: 95 },
      { name: 'Wed', value: 110, runtimeHours: 70 },
      { name: 'Thu', value: 130, runtimeHours: 85 },
      { name: 'Fri', value: 160, runtimeHours: 100 },
      { name: 'Sat', value: 70, runtimeHours: 40 },
      { name: 'Sun', value: 30, runtimeHours: 20 },
    ];
  } else if (type === 'monthly') {
    return [
      { name: 'Week 1', value: 700, runtimeHours: 400 },
      { name: 'Week 2', value: 750, runtimeHours: 420 },
      { name: 'Week 3', value: 680, runtimeHours: 380 },
      { name: 'Week 4', value: 720, runtimeHours: 410 },
    ];
  }
  return [];
};

// --- API Functions (Frontend Calls) ---

export const getMachineClassOverviews = async (): Promise<MachineClassOverview[]> => {
  // Now using the actual backend endpoint
  try {
    const response = await api.get('/machine-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching machine class overviews:', error);
    // Fallback to mock data if backend fails/unavailable during development
    return new Promise(resolve => setTimeout(() => resolve(mockMachineClasses), 500));
  }
};

export const getMachinesByClass = async (classId: string): Promise<MachineData[]> => {
  // Now using the actual backend endpoint
  try {
    const response = await api.get(`/machines`, { params: { classId } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching machines for class ${classId}:`, error);
    // Fallback to mock data if backend fails/unavailable during development
    const filteredMachines = mockMachines.filter(m => m.classId === classId);
    return new Promise(resolve => setTimeout(() => resolve(filteredMachines), 700));
  }
};

// API FUNCTION: To fetch a single machine's details
export const getMachineDetails = async (machineId: string): Promise<MachineData> => {
    try {
        const response = await api.get(`/machines/${machineId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for machine ${machineId}:`, error);
        // Fallback to local mock data if backend fails/unavailable during development
        const machine = mockMachines.find(m => m.id === machineId);
        if (machine) {
            return new Promise(resolve => setTimeout(() => resolve(machine), 800));
        }
        throw new Error('Machine not found or unable to fetch details.');
    }
};



export const getDashboardSummaryForClass = async (classId: string): Promise<DashboardSummary> => {
  // Now using the actual backend endpoint
  try {
    const response = await api.get(`/dashboard-summary/${classId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching dashboard summary for class ${classId}:`, error);
    // Fallback to mock data if backend fails/unavailable during development
    const machinesInClass = mockMachines.filter(m => m.classId === classId);
    const summary: DashboardSummary = {
      machinesOn: machinesInClass.filter(m => m.status === 'Running').length,
      machinesOff: machinesInClass.filter(m => m.status === 'Stopped').length,
      underMaintenance: machinesInClass.filter(m => m.status === 'Maintenance').length,
      currentDateJobsCompleted: Math.floor(Math.random() * 100),
      currentDateJobsPending: Math.floor(Math.random() * 20),
      currentDateJobsRunning: machinesInClass.filter(m => m.status === 'Running' && m.jobType).length,
      dailyChartData: generateMockChartData('daily'),
      weeklyChartData: generateMockChartData('weekly'),
      monthlyChartData: generateMockChartData('monthly'),
    };
    return new Promise(resolve => setTimeout(() => resolve(summary), 800));
  }
};

export const generateReport = async (reportConfig: { type: string; startDate?: string; endDate?: string; format: string }) => {
  // In a real application, this would be: return (await api.post('/reports/generate', reportConfig, { responseType: 'blob' })).data;
  console.log('POST /api/reports/generate request received with config:', reportConfig);

  // This part directly makes a request to the backend's /api/reports/generate endpoint.
  // It's the only one of these "API Functions" that doesn't use local mock data.
  try {
    const response = await api.post('/reports/generate', reportConfig, {
      responseType: 'blob' // Important for file downloads
    });
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};


// --- NEW CRUD Functions for Machines ---
// Get all machines (for the management list, no classId filter)
export const getAllMachines = async (): Promise<MachineData[]> => {
  try {
    const response = await api.get('/machines'); // Backend /api/machines handles this without classId
    return response.data;
  } catch (error) {
    console.error('Error fetching all machines:', error);
    // IMPORTANT: For production, remove mock data fallback for actual API calls.
    // For development convenience, you might keep a very simple mock for 'getAllMachines' if backend is not ready
    // e.g., return new Promise(resolve => setTimeout(() => resolve(mockMachines), 500));
    throw error; // Re-throw the error to be caught by the calling component
  }
};

// Create a new machine profile
export const createMachine = async (machineData: Partial<MachineData>): Promise<MachineData> => {
  try {
    const response = await api.post('/machines', machineData);
    return response.data;
  } catch (error) {
    console.error('Error creating machine:', error);
    throw error; // Re-throw the error
  }
};

// Update an existing machine profile
export const updateMachine = async (id: string, machineData: Partial<MachineData>): Promise<MachineData> => {
  try {
    const response = await api.put(`/machines/${id}`, machineData);
    return response.data;
  } catch (error) {
    console.error(`Error updating machine ${id}:`, error);
    throw error; // Re-throw the error
  }
};

// Delete a machine profile
export const deleteMachine = async (id: string): Promise<void> => {
  try {
    await api.delete(`/machines/${id}`);
  } catch (error) {
    console.error(`Error deleting machine ${id}:`, error);
    throw error; // Re-throw the error
  }
};
interface ReportNotificationData {
    type: string;
    startDate?: string;
    endDate?: string;
    recipientEmails: string[];
}

export const notifyReport = async (notificationData: ReportNotificationData): Promise<any> => {
    try {
        const response = await api.post('/reports/notify', notificationData);
        return response.data;
    } catch (error) {
        console.error('Error sending report notification:', error);
        throw error;
    }
};
// Add more API functions as you develop your backend (e.g., loginUser, getMachineDetails, updateSettings)
// export const loginUser = async (credentials: any) => { ... }


// Define the expected structure of a discovered device from the backend API
interface DiscoveredDeviceAPIResponse {
  ip: string;
  port: number;
  raw_data: string; // Raw response string
  status: string;
  runningTime: number | null;
  jobName: string;
  balanceTime: number | null;
  filename: string;
}

// Define the expected structure of the API response for discovery
interface DiscoveryAPIResponse {
  success: boolean;
  message: string;
  devices: DiscoveredDeviceAPIResponse[];
}

/**
 * Calls the backend API to perform UDP device discovery.
 * @param {string} [broadcastIp] - Optional custom broadcast IP.
 * @param {number} [timeout] - Optional timeout for the discovery process in milliseconds.
 * @returns {Promise<DiscoveryAPIResponse>} The response containing discovered devices.
 */
export const discoverDevicesUDP = async (broadcastIp?: string, timeout?: number): Promise<DiscoveryAPIResponse> => {
  try {
    const params: { broadcastIp?: string; timeout?: number } = {};
    if (broadcastIp) params.broadcastIp = broadcastIp;
    if (timeout) params.timeout = timeout;

    const response = await axios.get<DiscoveryAPIResponse>('/api/discover-devices', { params });
    return response.data;
  } catch (error) {
    console.error('Error in discoverDevicesUDP API call:', error);
    throw error; // Re-throw to be caught by the component
  }
};

// You might have other API functions here, e.g., for reporting or other machine interactions
// export const getMachineRealtimeStatus = async (machineId: string) => { /* ... */ };