// src/types/MachineData.ts
export interface MaintenanceLog {
  date: string;
  description: string;
  performedBy: string;
}

export interface FailureLog {
  date: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  action: string;
}

export interface MachineData {
  id: string;
  name: string;
  classId: string;
  status: 'Running' | 'Stopped' | 'Error' | 'Maintenance';
  jobType?: string;
  jobStartedAt?: string;
  estimatedRemainingTimeSec?: number;
  temperature: number;
  pressure: number;
  lastUpdated: string;
  // NEW PROPERTIES FOR DETAILS PAGE
  runtimeHours?: number;
  idleHours?: number;
  productivityScore?: number; // e.g., percentage
  maintenanceLogs?: MaintenanceLog[];
  failureHistory?: FailureLog[];
  performanceData?: { // For machine-specific charts
    daily: ChartDataItem[];
    weekly: ChartDataItem[];
    monthly: ChartDataItem[];
  };
}
export interface MachineClassOverview {
  id: string;
  name: string;
  onCount: number;
  offCount: number;
  maintenanceCount: number;
  runningTimeProductionHours: number;
}

export interface ChartDataItem {
  name: string; // Day, Week, Month, or Job Name
  value: number; // e.g., Number of Jobs
  timeTaken?: number; // For daily chart
  runtimeHours?: number; // For weekly/monthly chart
}

export interface DashboardSummary {
  machinesOn: number;
  machinesOff: number;
  underMaintenance: number;
  currentDateJobsCompleted: number;
  currentDateJobsPending: number;
  currentDateJobsRunning: number;
  dailyChartData: ChartDataItem[];
  weeklyChartData: ChartDataItem[];
  monthlyChartData: ChartDataItem[];
}