// src/types/api.ts

// This interface defines the structure of a single discovered device's raw data
export interface DiscoveredDeviceData {
    ip: string;
    port: number;
    data: string; // The raw response string received from the machine
}

// This interface defines the overall structure of the API response for device discovery
export interface DiscoveryAPIResponse {
    status: 'SUCCESS' | 'ERROR'; // This is the property TypeScript is complaining about
    message?: string; // Optional message from the API, e.g., "No devices found."
    devices: DiscoveredDeviceData[]; // An array of discovered device data
}

// You might also have other shared types here if needed