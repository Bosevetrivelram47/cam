// src/pages/MachineDiscoveryDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { discoverDevicesUDP } from '../services/api';

// Interface for a discovered device (same as before)
interface DiscoveredDevice {
  ip: string;
  port: number;
  data: string; // The raw response from the machine
  parsedStatus?: string; // Parsed status like 'Running', 'Stopped'
  lastUpdated?: string; // Timestamp of when this device's status was last updated
}

const MachineDiscoveryDashboard: React.FC = () => {
  // Use a Map for discoveredMachines to easily check for existence and update by IP
  const [discoveredMachines, setDiscoveredMachines] = useState<Map<string, DiscoveredDevice>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState(5000); // Poll every 5 seconds (5000ms)
  const [isPolling, setIsPolling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Function to perform UDP Discovery ---
  const performDiscovery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await discoverDevicesUDP();
      console.log('Discovered devices from API:', response);

      if (response && Array.isArray(response.devices)) {
        // Create a new Map for the updated state
        const updatedMachines = new Map(discoveredMachines); // Start with current machines

        let newMachineCount = 0;
        let updatedMachineCount = 0;

        if (response.devices.length > 0) {
            response.devices.forEach((device: any) => {
                // --- IMPORTANT: PARSE MACHINE RESPONSE ---
                // Adjust based on your machine's actual response format.
                let parsedStatus = 'Unknown';
                const statusMatch = device.data.match(/Status:\s*([a-zA-Z0-9_ -]+)/);
                if (statusMatch && statusMatch[1]) {
                    parsedStatus = statusMatch[1].trim();
                }

                const newMachineData: DiscoveredDevice = {
                    ip: device.ip,
                    port: device.port,
                    data: device.data,
                    parsedStatus: parsedStatus,
                    lastUpdated: new Date().toLocaleTimeString(),
                };

                // Check if this machine already exists in our state
                if (updatedMachines.has(device.ip)) {
                    // Update existing machine's data
                    updatedMachines.set(device.ip, newMachineData);
                    updatedMachineCount++;
                } else {
                    // Add new machine
                    updatedMachines.set(device.ip, newMachineData);
                    newMachineCount++;
                }
            });

            if (newMachineCount > 0) {
                setSuccessMessage(`Found ${newMachineCount} new machine(s) and updated ${updatedMachineCount} existing.`);
            } else if (updatedMachineCount > 0) {
                setSuccessMessage(`Updated status for ${updatedMachineCount} machine(s).`);
            } else {
                setSuccessMessage('No new machines found, no status updated.');
            }
        } else {
            setSuccessMessage("No devices responded to discovery.");
        }

        setDiscoveredMachines(updatedMachines); // Update the state with the merged Map
      } else {
        // If response.devices is not an array or is null/undefined
        setDiscoveredMachines(new Map()); // Clear existing if no valid response received
        setError("Invalid response format received from device discovery API.");
        console.warn("Invalid response format:", response);
      }
    } catch (err: any) {
      console.error('Error during device discovery:', err);
      setError(err.response?.data?.message || 'Failed to discover devices.');
      // Keep existing machines on network error, but don't add new ones if discovery failed
    } finally {
      setLoading(false);
    }
  }, [discoveredMachines]); // Dependency on discoveredMachines to access its latest state

  // --- Polling Logic (remains mostly same) ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPolling) {
      // Run immediately when polling starts
      performDiscovery();
      intervalId = setInterval(performDiscovery, pollingInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, pollingInterval, performDiscovery]);

  // Clear success messages after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  // --- Handlers for UI ---
  const handleStartPolling = () => {
    setIsPolling(true);
  };

  const handleStopPolling = () => {
    setIsPolling(false);
    setSuccessMessage('Stopped polling.');
  };

  // Convert Map values to an array for rendering
  const machinesToDisplay = Array.from(discoveredMachines.values());

  return (
    <div className="discovery-dashboard-container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Machine Discovery & Status</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Polling Interval (ms):
          <input
            type="number"
            value={pollingInterval}
            onChange={(e) => setPollingInterval(Math.max(1000, parseInt(e.target.value)))} // Min 1 second
            disabled={isPolling}
            style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <button
          onClick={handleStartPolling}
          disabled={isPolling || loading}
          style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}
        >
          {loading && isPolling ? 'Discovering...' : 'Start Discovery & Polling'}
        </button>
        <button
          onClick={handleStopPolling}
          disabled={!isPolling || loading}
          style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer' }}
        >
          Stop Polling
        </button>
      </div>

      {loading && <p style={{ color: '#007bff' }}>{isPolling ? 'Discovering and updating...' : 'Discovering devices...'}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <h2>Discovered Machines ({machinesToDisplay.length})</h2>
      {machinesToDisplay.length === 0 && !loading && !error && (
        <p>No machines discovered yet. Click "Start Discovery & Polling".</p>
      )}

      <div className="machine-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {machinesToDisplay.map((machine) => ( // No 'index' needed if using unique 'ip' as key
          <div key={machine.ip} className="machine-card" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: machine.parsedStatus?.toLowerCase().includes('running') ? '#e6ffe6' : '#fff', // Light green for running
          }}>
            <h3>Device: {machine.ip}</h3> {/* Display IP as main identifier */}
            <p><strong>Port:</strong> {machine.port}</p>
            <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: machine.parsedStatus?.toLowerCase().includes('running') ? 'green' : (machine.parsedStatus?.toLowerCase().includes('stopped') ? 'red' : 'orange') }}>{machine.parsedStatus}</span></p>
            <p><strong>Last Updated:</strong> {machine.lastUpdated}</p>
            <details style={{ marginTop: '10px', fontSize: '0.9em', color: '#555' }}>
              <summary>Raw Response</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
                {machine.data}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineDiscoveryDashboard;