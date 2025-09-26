// src/pages/MachineDiscoveryDashboard.test.tsx

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MachineDiscoveryDashboard from './MachineDiscoveryDashboard';

// Mock the discoverDevicesUDP function from '../services/api'
jest.mock('../services/api', () => ({
    discoverDevicesUDP: jest.fn(),
}));

// Import the mocked function after the jest.mock call
import { discoverDevicesUDP } from '../services/api';
const mockedDiscoverDevicesUDP = discoverDevicesUDP as jest.Mock;

// Mock the Date object to control new Date() for consistent `lastUpdated` timestamps
const MOCK_DATE = new Date('2025-07-24T10:00:00Z');
const MOCK_TIME_STRING = MOCK_DATE.toLocaleTimeString(); // Will be consistent across tests

// Spy on console methods to suppress output during tests and check for unexpected calls
let consoleErrorSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

beforeEach(() => {
    // Enable Jest's fake timers to control setInterval/setTimeout
    jest.useFakeTimers();

    // Clear and reset mocks before each test
    mockedDiscoverDevicesUDP.mockClear();
    mockedDiscoverDevicesUDP.mockReset();

    // Set a default mock implementation for discoverDevicesUDP
    // This ensures tests don't fail if the mock isn't explicitly set for a specific test case
    mockedDiscoverDevicesUDP.mockResolvedValue({
        devices: [], // Default to an empty array of devices
    });

    // Mock Date.now() and new Date() to return a fixed time for consistent snapshots
    const mockDate = MOCK_DATE;
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    // Suppress console messages during tests to keep test output clean
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(async () => {
    // Run any pending timers to ensure all async operations are settled
    await act(async () => {
        jest.runOnlyPendingTimers();
    });
    // Restore original timers and console methods
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    // Restore all mocked modules (including discoverDevicesUDP)
    jest.restoreAllMocks();
});

describe('MachineDiscoveryDashboard', () => {
    // Test 1: Renders correctly with initial state
    test('renders correctly with initial state', () => {
        render(<MachineDiscoveryDashboard />);

        expect(screen.getByText(/Machine Discovery & Status/i)).toBeInTheDocument();
        expect(screen.getByText(/No machines discovered yet. Click "Start Discovery & Polling"./i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Start Discovery & Polling/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Stop Polling/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Polling Interval \(ms\):/i)).toBeInTheDocument();

        // Check initial button and input states
        expect(screen.getByRole('button', { name: /Start Discovery & Polling/i })).not.toBeDisabled();
        expect(screen.getByRole('button', { name: /Stop Polling/i })).toBeDisabled();
        const intervalInput = screen.getByLabelText(/Polling Interval \(ms\):/i) as HTMLInputElement;
        expect(intervalInput).toHaveValue(5000);
        expect(intervalInput).not.toBeDisabled();
    });

    // Test 2: Starts polling and discovers new machines
    test('starts polling and discovers new machines', async () => {
        // Mock a successful API response with one new device
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [{
                ip: '192.168.1.10',
                port: 1234,
                data: 'Status: RUNNING\nRunning Time: 120.00 min',
            }],
        });

        render(<MachineDiscoveryDashboard />);

        // Click the start button
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        // Expect loading message and API call
        expect(screen.getByText(/Discovering devices.../i)).toBeInTheDocument();
        expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(1);

        // Wait for the discovery to complete and UI to update
        await waitFor(() => {
            expect(screen.queryByText(/Discovering devices.../i)).not.toBeInTheDocument();
            expect(screen.getByText(/Discovering and updating.../i)).toBeInTheDocument(); // Polling message appears
            expect(screen.getByText(/Found 1 new machine\(s\) and updated 0 existing./i)).toBeInTheDocument();
            expect(screen.getByText(/Device: 192.168.1.10/i)).toBeInTheDocument();
            expect(screen.getByText(/Status: RUNNING/i)).toBeInTheDocument();
            expect(screen.getByText(`Last Updated: ${MOCK_TIME_STRING}`)).toBeInTheDocument(); // Check last updated time
            expect(screen.getByText(/Discovered Machines \(1\)/i)).toBeInTheDocument();
        });

        // Ensure buttons are in correct state
        expect(screen.getByRole('button', { name: /Start Discovery & Polling/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Stop Polling/i })).not.toBeDisabled();
        expect(screen.getByLabelText(/Polling Interval \(ms\):/i)).toBeDisabled();
    });

    // Test 3: Updates existing machine status during polling
    test('updates existing machine status during polling', async () => {
        // Initial discovery
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [{
                ip: '192.168.1.10',
                port: 1234,
                data: 'Status: RUNNING\nRunning Time: 120.00 min',
            }],
        });

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(/Status: RUNNING/i)).toBeInTheDocument();
            expect(screen.getByText(/Found 1 new machine\(s\) and updated 0 existing./i)).toBeInTheDocument();
        });

        // Mock next poll response with updated status for the same device
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [{
                ip: '192.168.1.10',
                port: 1234,
                data: 'Status: IDLE\nRunning Time: 125.00 min',
            }],
        });

        // Advance timers to trigger the next poll
        await act(async () => {
            jest.advanceTimersByTime(5000); // Advance by pollingInterval
        });

        // Expect the status to be updated
        await waitFor(() => {
            expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(2);
            expect(screen.getByText(/Status: IDLE/i)).toBeInTheDocument();
            expect(screen.getByText(/Updated status for 1 machine\(s\)./i)).toBeInTheDocument();
            // The loading state should clear after successful update
            expect(screen.queryByText(/Discovering and updating.../i)).not.toBeInTheDocument();
        });
    });

    // Test 4: Handles no new/updated machines during polling
    test('handles no new/updated machines during polling', async () => {
        // Initial discovery
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [{
                ip: '192.168.1.10',
                port: 1234,
                data: 'Status: RUNNING',
            }],
        });

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(/Status: RUNNING/i)).toBeInTheDocument();
        });

        // Mock next poll response with identical data
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [{
                ip: '192.168.1.10',
                port: 1234,
                data: 'Status: RUNNING',
            }],
        });

        // Advance timers to trigger the next poll
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        await waitFor(() => {
            expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(2);
            expect(screen.getByText(/No new machines found, no status updated./i)).toBeInTheDocument();
            expect(screen.queryByText(/Discovering and updating.../i)).not.toBeInTheDocument();
        });
    });

    // Test 5: Stops polling when stop button is clicked
    test('stops polling when stop button is clicked', async () => {
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({ devices: [] }); // Initial call

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByRole('button', { name: /Stop Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(/Stopped polling./i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Start Discovery & Polling/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /Stop Polling/i })).toBeDisabled();
            expect(screen.getByLabelText(/Polling Interval \(ms\):/i)).not.toBeDisabled();
        });

        // Advance timers to ensure no further calls are made
        await act(async () => {
            jest.advanceTimersByTime(10000); // Twice the polling interval
        });
        expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(1); // Should not have been called again

        // Expect success message to clear after its timeout
        await act(async () => {
            jest.advanceTimersByTime(3000); // clear success message after 3 seconds
        });
        await waitFor(() => {
            expect(screen.queryByText(/Stopped polling./i)).not.toBeInTheDocument();
            expect(screen.getByText(/No machines discovered yet. Click "Start Discovery & Polling"./i)).toBeInTheDocument();
        });
    });

    // Test 6: Displays an error message if discovery fails
    test('displays an error message if discovery fails', async () => {
        const errorMessage = 'Network error: Failed to connect.';
        mockedDiscoverDevicesUDP.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
            expect(screen.queryByText(/Discovering devices.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /Start Discovery & Polling/i })).not.toBeDisabled();
        expect(screen.getByRole('button', { name: /Stop Polling/i })).toBeDisabled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error during device discovery:', expect.any(Object));
    });

    // Test 7: Handles generic error message if response data is missing
    test('displays generic error message if error response data is missing', async () => {
        mockedDiscoverDevicesUDP.mockRejectedValueOnce(new Error('Something unexpected happened'));

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(/Error: Failed to discover devices./i)).toBeInTheDocument();
        });
    });

    // Test 8: Handles invalid API response format
    test('handles invalid API response format', async () => {
        // Mock an invalid response (e.g., no 'devices' array or 'status')
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({ someOtherKey: 'value' });

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(/Error: Invalid response format received from device discovery API./i)).toBeInTheDocument();
        });
        expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid response format:', { someOtherKey: 'value' });
    });


    // Test 9: Allows changing polling interval
    test('allows changing polling interval', async () => {
        render(<MachineDiscoveryDashboard />);

        const intervalInput = screen.getByLabelText(/Polling Interval \(ms\):/i) as HTMLInputElement;

        // Change interval before starting polling
        await userEvent.clear(intervalInput);
        await userEvent.type(intervalInput, '2000');
        expect(intervalInput).toHaveValue(2000);

        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(intervalInput).toBeDisabled(); // Should be disabled when polling
            expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(1);
        });

        // Advance by 2 seconds (new interval) for the next call
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });
        expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(2);

        // Advance by 5 seconds (old interval) - should not trigger a call
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });
        expect(mockedDiscoverDevicesUDP).toHaveBeenCalledTimes(2); // Still 2 calls, not 3

        fireEvent.click(screen.getByRole('button', { name: /Stop Polling/i }));
        await waitFor(() => {
            expect(intervalInput).not.toBeDisabled(); // Should be enabled after stopping
        });
    });

    // Test 10: Ensures `DiscoveredDevice` type in component's state is correctly managed
    test('ensures DiscoveredDevice type in component state is correctly managed', async () => {
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [{
                ip: '192.168.1.111',
                port: 8080,
                data: 'Status: OK\nSomeOtherData: Value',
            }],
        });

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            // Check that parsedStatus and lastUpdated are present
            expect(screen.getByText(/Status: OK/i)).toBeInTheDocument();
            expect(screen.getByText(`Last Updated: ${MOCK_TIME_STRING}`)).toBeInTheDocument();

            // Check raw data is present (within details/summary)
            const summary = screen.getByText('Raw Response');
            fireEvent.click(summary); // Open details
            expect(screen.getByText(/Status: OK\nSomeOtherData: Value/i)).toBeInTheDocument();
        });
    });

    // Test 11: Displayed message for zero devices on initial discovery
    test('displays message for zero devices on initial discovery', async () => {
        mockedDiscoverDevicesUDP.mockResolvedValueOnce({
            devices: [],
        });

        render(<MachineDiscoveryDashboard />);
        fireEvent.click(screen.getByRole('button', { name: /Start Discovery & Polling/i }));

        await waitFor(() => {
            expect(screen.getByText(/No devices responded to discovery./i)).toBeInTheDocument();
            expect(screen.getByText(/Discovered Machines \(0\)/i)).toBeInTheDocument();
        });

        // Wait for the success message to clear
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        await waitFor(() => {
            expect(screen.queryByText(/No devices responded to discovery./i)).not.toBeInTheDocument();
            expect(screen.getByText(/No machines discovered yet. Click "Start Discovery & Polling"./i)).toBeInTheDocument();
        });
    });
});