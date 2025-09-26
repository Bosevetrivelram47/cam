// backend/discovery.js

import dgram  from 'dgram'
import os  from 'os'; // Needed for calculatePrimaryBroadcastAddress
import { UDP_PORT, DISCOVERY_MESSAGE } from './config.js' // Assuming config is also externalized

/**
 * Calculates the primary broadcast address of the system.
 * Looks for the first non-internal IPv4 interface.
 * @returns {string|null} The broadcast address or null if not found/calculable.
 */
export function calculatePrimaryBroadcastAddress() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            // Only consider IPv4 and external interfaces
            if (iface.family === 'IPv4' && !iface.internal) {
                // If broadcast address is directly provided
                if (iface.broadcast) {
                    return iface.broadcast;
                } else if (iface.address && iface.netmask) {
                    // Calculate broadcast address if not directly provided
                    const ip = iface.address.split('.').map(Number);
                    const netmask = iface.netmask.split('.').map(Number);
                    const broadcast = [];
                    for (let i = 0; i < 4; i++) {
                        broadcast[i] = ip[i] | (~netmask[i] & 255);
                    }
                    return broadcast.join('.');
                }
            }
        }
    }
    return null;
}


/**
 * Discovers devices on the network using UDP broadcast.
 * @param {string} broadcastIp - The IP address to broadcast to.
 * @param {number} timeout - How long to wait for responses in milliseconds.
 * @returns {Promise<Array<{ip: string, port: number, data: string}>>} A promise that resolves with an array of discovered device data.
 */
export async function discoverDeviceUDP(broadcastIp, timeout) {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        const discoveredDevices = [];
        let timer;

        socket.on('message', (msg, rinfo) => {
            const data = msg.toString();
            // Assuming your devices respond with an identifying string
            // You might want to add more robust validation here
            if (data && rinfo.address) {
                discoveredDevices.push({ ip: rinfo.address, port: rinfo.port, data: data });
            }
        });

        socket.on('error', (err) => {
            clearTimeout(timer);
            socket.close();
            reject(err);
        });

        socket.on('listening', () => {
            const address = socket.address();
            // console.log(`UDP Server listening on ${address.address}:${address.port}`);
            socket.setBroadcast(true); // Enable broadcast
            const message = Buffer.from(DISCOVERY_MESSAGE);
            socket.send(message, UDP_PORT, broadcastIp, (err) => {
                if (err) {
                    clearTimeout(timer);
                    socket.close();
                    return reject(err);
                }
                // console.log(`Sent discovery message to ${broadcastIp}:${UDP_PORT}`);
            });
        });

        socket.bind(UDP_PORT, () => {
            // Start the timeout AFTER binding and sending the message
            timer = setTimeout(() => {
                socket.close(); // Close the socket after timeout
                resolve(discoveredDevices);
            }, timeout);
        });
    });
}

