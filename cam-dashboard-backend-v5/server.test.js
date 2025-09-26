// backend/server.test.js

// IMPORTANT: ALL MOCKS MUST BE AT THE VERY TOP OF THE FILE
// BEFORE ANY `require` or `import` statements of the modules they mock.

const request = require('supertest');
const os = require('os');
const dgram = require('dgram'); // Explicitly import dgram to mock it correctly

// --- Mocks ---

// 1. Mock `dgram`
// This mock captures the socket instance created by dgram.createSocket
// so we can clear its internal mocks in beforeEach.
let mockSocketInstance;
jest.mock('dgram', () => {
    const mockSocket = {
        bind: jest.fn((port, callback) => {
            if (callback) callback(); // Immediately call callback for bind
            return mockSocket; // Allow chaining
        }),
        setBroadcast: jest.fn(() => mockSocket), // Allow chaining
        send: jest.fn((message, port, address, callback) => {
            if (callback) callback(); // Immediately call callback for send
        }),
        on: jest.fn(), // Mock the 'on' method for event listeners
        close: jest.fn(), // Mock the 'close' method
        address: jest.fn(() => ({ address: '127.0.0.1', port: 3001 })), // Mock address
    };

    return {
        createSocket: jest.fn(() => {
            mockSocketInstance = mockSocket; // Capture the instance created
            return mockSocket;
        }),
    };
});

// 2. Mock `db.js`
const mockDb = {
    query: jest.fn(), // Will be reset in beforeEach
    getConnection: jest.fn(() => Promise.resolve({
        release: jest.fn() // Mock release method for connection pooling
    })),
    end: jest.fn(() => Promise.resolve()), // Mock end for clean shutdown
};
jest.mock('./db', () => mockDb);

// 3. Mock `backend/discovery.js`
// This creates a completely mocked version of the discovery module.
// We then control its functions' behavior in beforeEach/test.
const mockedDiscoveryModule = {
    discoverDeviceUDP: jest.fn(),
    calculatePrimaryBroadcastAddress: jest.fn(),
};
jest.mock('./discovery', () => mockedDiscoveryModule);


// 4. Import the constants from config (no mock needed for config itself unless values change)
const { DEFAULT_TIMEOUT } = require('./config');

// 5. Import `app` from server.js and `parseMachineStatusResponse` from `utils.js`
// Make sure server.js loads AFTER all its dependencies are mocked.
const { app } = require('./server');
const { parseMachineStatusResponse } = require('./utils');


describe('Backend API Tests', () => {
    // No need for a global osNetworkInterfacesSpy here, as we're mocking calculatePrimaryBroadcastAddress directly.

    // Configure global mocks and reset them before each test
    beforeEach(() => {
        // Reset all Jest mocks to their initial state
        jest.clearAllMocks();

        // --- Mock `dgram` socket instance ---
        // Ensure mockSocketInstance is reset. If dgram.createSocket was called in previous test,
        // it needs to be reset for subsequent tests.
        // This block needs to run *after* dgram.createSocket is potentially called within a test
        // but *before* the assertions for that test. A good way is to ensure `mockSocketInstance` is freshly acquired.
        // Or, more simply, just clear all mocks on the `dgram` module itself, and then `mockSocketInstance`
        // will be re-assigned when `createSocket` is called in `discoverDeviceUDP`.

        // Since dgram.createSocket is mocked, its return value (mockSocketInstance)
        // will be a new mock object for each call to createSocket (if our mock setup allows).
        // Let's ensure the dgram mock setup is solid and its internal state is reset.
        if (mockSocketInstance) { // Clear existing mock instance if it exists from previous tests
            mockSocketInstance.bind.mockClear();
            mockSocketInstance.setBroadcast.mockClear();
            mockSocketInstance.send.mockClear();
            mockSocketInstance.on.mockClear();
            mockSocketInstance.close.mockClear();
            mockSocketInstance.address.mockClear();
        }
        // The dgram.createSocket mock will create a *new* mockSocketInstance each time it's called
        // within a test, so clearing the *module-level* dgram mock is more effective.
        dgram.createSocket.mockClear();


        // --- Mock `discovery.js` functions ---
        mockedDiscoveryModule.discoverDeviceUDP.mockClear();
        mockedDiscoveryModule.calculatePrimaryBroadcastAddress.mockClear();

        // Default behavior for discoverDeviceUDP
        mockedDiscoveryModule.discoverDeviceUDP.mockResolvedValue([]);

        // Default behavior for calculatePrimaryBroadcastAddress for most API tests
        mockedDiscoveryModule.calculatePrimaryBroadcastAddress.mockReturnValue('192.168.1.255');


        // --- Mock `db.js` functions ---
        mockDb.query.mockClear();
        mockDb.query.mockImplementation((sql, params) => {
            if (sql.includes('SELECT id FROM machine_discovery_status')) {
                return Promise.resolve([[]]); // Default to no existing machines
            } else if (sql.includes('UPDATE machine_discovery_status')) {
                return Promise.resolve([{ affectedRows: 1 }]);
            } else if (sql.includes('INSERT INTO machine_discovery_status')) {
                return Promise.resolve([{ insertId: 456, affectedRows: 1 }]);
            } else if (sql.includes('SELECT 1 + 1')) {
                return Promise.resolve([[{ solution: 2 }]]); // For DB connection check
            }
            return Promise.resolve([]);
        });
    });

    // Increase default Jest timeout for tests that involve mocked asynchronous operations
    jest.setTimeout(10000); // 10 seconds

    describe('GET /api/discover-devices', () => {

        it('should return parsed and updated discovered devices on success and insert new ones', async () => {
            mockedDiscoveryModule.discoverDeviceUDP.mockResolvedValueOnce([
                { ip: '192.168.1.10', port: 3000, data: 'Status: RUNNING RunningTime: 120min Job: JobX Balance: 30min File: print.gcode' },
                { ip: '192.168.1.11', port: 3000, data: 'Status: IDLE RunningTime: 0 Job: N/A Balance: N/A File: N/A' }
            ]);

            mockDb.query
                .mockResolvedValueOnce([[]]) // SELECT for 192.168.1.10 (no existing)
                .mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }]) // INSERT for 192.168.1.10
                .mockResolvedValueOnce([[]]) // SELECT for 192.168.1.11 (no existing)
                .mockResolvedValueOnce([{ insertId: 2, affectedRows: 1 }]); // INSERT for 192.168.1.11

            const res = await request(app).get('/api/discover-devices');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            // The message for 'Found and updated 0 device(s). Inserted 2 new device(s).' is correct
            // based on the mocked DB behavior (no existing devices).
            expect(res.body.message).toContain('Found and updated 0 device(s). Inserted 2 new device(s).');
            expect(res.body.devices).toHaveLength(2);
            expect(res.body.devices[0].status).toBe('RUNNING');
            expect(res.body.devices[1].status).toBe('IDLE');
            expect(res.body.devices[1].jobName).toBe('N/A');
            expect(res.body.devices[1].filename).toBe('N/A');

            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledTimes(1);
            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledWith(
                '192.168.1.255',
                DEFAULT_TIMEOUT
            );
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress).toHaveBeenCalledTimes(1);

            expect(mockDb.query).toHaveBeenCalledTimes(4);
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id FROM machine_discovery_status'),
                ['192.168.1.10']
            );
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO machine_discovery_status'),
                expect.arrayContaining(['192.168.1.10', 3000, 'RUNNING', 120, 'JobX', 30, 'print.gcode', 'Status: RUNNING RunningTime: 120min Job: JobX Balance: 30min File: print.gcode'])
            );
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id FROM machine_discovery_status'),
                ['192.168.1.11']
            );
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO machine_discovery_status'),
                expect.arrayContaining(['192.168.1.11', 3000, 'IDLE', 0, 'N/A', null, 'N/A', 'Status: IDLE RunningTime: 0 Job: N/A Balance: N/A File: N/A'])
            );
        });

        it('should update existing machines in the database', async () => {
            mockedDiscoveryModule.discoverDeviceUDP.mockResolvedValueOnce([
                { ip: '192.168.1.10', port: 3000, data: 'Status: RUNNING RunningTime: 10min Job: JobA File: fileA' },
            ]);

            mockDb.query
                .mockResolvedValueOnce([[{ id: 123, ip_address: '192.168.1.10' }]]) // Simulate existing device
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // Simulate update success

            const res = await request(app).get('/api/discover-devices');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            // The message for 'Found and updated 1 device(s). Inserted 0 new device(s).' is correct
            expect(res.body.message).toContain('Found and updated 1 device(s). Inserted 0 new device(s).');
            expect(res.body.devices).toHaveLength(1);
            expect(res.body.devices[0].status).toBe('RUNNING');

            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledTimes(1);
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress).toHaveBeenCalledTimes(1);
            expect(mockDb.query).toHaveBeenCalledTimes(2);

            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id FROM machine_discovery_status'),
                ['192.168.1.10']
            );
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE machine_discovery_status'),
                expect.arrayContaining([
                    3000, 'RUNNING', 10, 'JobA', null, 'fileA', 'Status: RUNNING RunningTime: 10min Job: JobA File: fileA', '192.168.1.10'
                ])
            );
        });

        it('should return empty array if no devices are found', async () => {
            mockedDiscoveryModule.discoverDeviceUDP.mockResolvedValueOnce([]);

            const res = await request(app).get('/api/discover-devices');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('No devices found within timeout.');
            expect(res.body.devices).toHaveLength(0);
            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledTimes(1);
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress).toHaveBeenCalledTimes(1);
            expect(mockDb.query).toHaveBeenCalledTimes(0);
        });

        it('should handle errors from UDP discovery', async () => {
            // Mock discovery.js's discoverDeviceUDP to reject
            mockedDiscoveryModule.discoverDeviceUDP.mockRejectedValueOnce(new Error('Network unreachable'));

            const res = await request(app).get('/api/discover-devices');

            expect(res.statusCode).toEqual(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Failed to discover devices: Network unreachable');
            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledTimes(1);
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress).toHaveBeenCalledTimes(1); // Still called to get broadcast IP
            expect(mockDb.query).toHaveBeenCalledTimes(0);
        });

        it('should use custom broadcastIp and timeout from query params', async () => {
            mockedDiscoveryModule.discoverDeviceUDP.mockResolvedValueOnce([]);

            // Clear the mock for calculatePrimaryBroadcastAddress to ensure it's NOT called
            mockedDiscoveryModule.calculatePrimaryBroadcastAddress.mockClear();

            const customIp = '192.168.1.254';
            const customTimeout = 7000;

            const res = await request(app).get(`/api/discover-devices?broadcastIp=${customIp}&timeout=${customTimeout}`);

            expect(res.statusCode).toEqual(200);
            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledTimes(1);
            expect(mockedDiscoveryModule.discoverDeviceUDP).toHaveBeenCalledWith(customIp, customTimeout);
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress).not.toHaveBeenCalled(); // Crucial: should not be called
        });
    });

    // --- Unit tests for parseMachineStatusResponse function ---
    describe('parseMachineStatusResponse', () => {
        // These tests do not need any mocking beyond their direct dependencies,
        // so they should pass if utils.js is correct.
        it('should parse all fields correctly from a comprehensive string', () => {
            const rawResponse = "Status: ACTIVE RunningTime: 15.5h Job: Big_Project.gcode Balance: 123.4s File: project_final.gcode";
            const parsed = parseMachineStatusResponse(rawResponse);
            expect(parsed).toEqual({
                status: 'ACTIVE',
                runningTime: 930, // 15.5 * 60 = 930 minutes
                balanceTime: 2.0566666666666666, // 123.4 / 60 minutes
                jobName: 'Big_Project.gcode',
                filename: 'project_final.gcode'
            });
        });

        it('should handle missing fields gracefully', () => {
            const rawResponse = "Status: IDLE Job: standby_job";
            const parsed = parseMachineStatusResponse(rawResponse);
            expect(parsed).toEqual({
                status: 'IDLE',
                runningTime: null,
                jobName: 'standby_job',
                balanceTime: null,
                filename: 'N/A'
            });
        });

        it('should handle different time unit formats', () => {
            expect(parseMachineStatusResponse("RunningTime: 30m Balance: 5min").runningTime).toBe(30);
            expect(parseMachineStatusResponse("RunningTime: 2h").runningTime).toBe(120);
            expect(parseMachineStatusResponse("RunningTime: 2.5h").runningTime).toBe(150);
            expect(parseMachineStatusResponse("RunningTime: 100").runningTime).toBe(100);

            expect(parseMachineStatusResponse("Balance: 120s").balanceTime).toBe(2);
            expect(parseMachineStatusResponse("Balance: 30min").balanceTime).toBe(30);
            expect(parseMachineStatusResponse("Balance: 10").balanceTime).toBe(10);
        });

        it('should handle "N/A" or empty values for fields', () => {
            const rawResponse = "Status: STOPPED RunningTime: N/A Job: N/A Balance: N/A File: N/A";
            const parsed = parseMachineStatusResponse(rawResponse);
            expect(parsed).toEqual({
                status: 'STOPPED',
                runningTime: null,
                jobName: 'N/A',
                balanceTime: null,
                filename: 'N/A'
            });

            const rawResponseEmpty = "Status: STOPPED RunningTime: Job: Balance: File:";
            const parsedEmpty = parseMachineStatusResponse(rawResponseEmpty);
            expect(parsedEmpty).toEqual({
                status: 'STOPPED',
                runningTime: null,
                jobName: 'N/A',
                balanceTime: null,
                filename: 'N/A'
            });
        });

        it('should default to UNKNOWN/N/A/null if no matches found', () => {
            const rawResponse = "Some random text without expected patterns";
            const parsed = parseMachineStatusResponse(rawResponse);
            expect(parsed).toEqual({
                status: 'UNKNOWN',
                runningTime: null,
                jobName: 'N/A',
                balanceTime: null,
                filename: 'N/A'
            });
        });
    });

    // ... (rest of your server.test.js file remains the same until this block) ...

    // --- Unit tests for calculatePrimaryBroadcastAddress function (from discovery.js) ---
    describe('calculatePrimaryBroadcastAddress', () => {
        let localOsNetworkInterfacesSpy;

        beforeEach(() => {
            // No need to mockRestore here. We are testing `calculatePrimaryBroadcastAddress`
            // as it exists in the mockedDiscoveryModule, but by controlling its internal `os` dependency.
            // Ensure calculatePrimaryBroadcastAddress is using its *real* implementation for these tests
            // by calling jest.requireActual.
            const originalDiscoveryModule = jest.requireActual('./discovery');
            mockedDiscoveryModule.calculatePrimaryBroadcastAddress.mockImplementation(originalDiscoveryModule.calculatePrimaryBroadcastAddress);

            // Spy on os.networkInterfaces ONLY for these specific tests
            localOsNetworkInterfacesSpy = jest.spyOn(os, 'networkInterfaces');
        });

        afterEach(() => {
            localOsNetworkInterfacesSpy.mockRestore(); // Clean up the spy on os
            // After these tests, re-mock calculatePrimaryBroadcastAddress for the API tests
            mockedDiscoveryModule.calculatePrimaryBroadcastAddress.mockReturnValue('192.168.1.255');
        });

        it('should return the broadcast address when available directly', () => {
            localOsNetworkInterfacesSpy.mockReturnValueOnce({
                'test_eth': [
                    { address: '10.0.0.5', netmask: '255.255.255.0', family: 'IPv4', internal: false, broadcast: '10.0.0.255' },
                ]
            });
            // Now, when you call it, it uses the actual implementation of calculatePrimaryBroadcastAddress
            // which internally calls the spied-on os.networkInterfaces.
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress()).toBe('10.0.0.255');
        });

        it('should calculate broadcast address when not available directly', () => {
            localOsNetworkInterfacesSpy.mockReturnValueOnce({
                'test_eth_no_broadcast': [
                    { address: '172.16.0.10', netmask: '255.255.0.0', family: 'IPv4', internal: false },
                ]
            });
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress()).toBe('172.16.255.255');
        });

        it('should return null if no suitable IPv4 interface found', () => {
            localOsNetworkInterfacesSpy.mockReturnValueOnce({
                'lo': [{ address: '127.0.0.1', netmask: '255.0.0.0', family: 'IPv4', internal: true }],
                'eth0': [{ address: 'fe80::1', netmask: 'ffff:ffff:ffff:ffff::', family: 'IPv6', internal: false }],
            });
            expect(mockedDiscoveryModule.calculatePrimaryBroadcastAddress()).toBeNull();
        });
    });
});
    

