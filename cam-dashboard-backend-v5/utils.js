// backend/utils.js

/**
 * Parses the raw machine status response string into a structured object.
 * @param {string} rawResponse - The raw string response from a machine.
 * @returns {object} An object containing parsed machine status details.
 */
export function parseMachineStatusResponse(rawResponse) {
    // Helper to extract a value based on a key, stopping at the next known key or end of string
    const extractValue = (key) => {
        // Regex to find 'Key: ' followed by anything (non-greedy) until the next known key or end of string
        // The list of "next keys" should cover all possible field names in your response.
        // Added \\n to the lookahead for multi-line robustness.
        const regex = new RegExp(`${key}:\\s*(.*?)(?=\\s*(Status|RunningTime|Job|Balance|File):|$|\\n)`, 'i');
        const match = rawResponse.match(regex);
        return match && match[1] ? match[1].trim() : '';
    };

    // Extract raw values
    const statusRaw = extractValue('Status');
    const runningTimeRaw = extractValue('RunningTime');
    const jobNameRaw = extractValue('Job');
    const balanceTimeRaw = extractValue('Balance');
    const filenameRaw = extractValue('File');

    // Helper to parse time values
    const parseTime = (value) => {
        if (!value || value.toLowerCase() === 'n/a') return null;
        let numVal = parseFloat(value);
        if (isNaN(numVal)) return null; // Handle cases where value is not a number

        if (value.toLowerCase().endsWith('h')) {
            return numVal * 60; // Convert hours to minutes
        } else if (value.toLowerCase().endsWith('s')) {
            return numVal / 60; // Convert seconds to minutes
        } else {
            // Assume minutes if no unit or 'min'/'m' is present
            return numVal;
        }
    };

    // Process and normalize values
    return {
        status: statusRaw || 'UNKNOWN', // Default to UNKNOWN if empty
        runningTime: parseTime(runningTimeRaw),
        jobName: (jobNameRaw.toLowerCase() === 'n/a' || jobNameRaw === '') ? 'N/A' : jobNameRaw,
        balanceTime: parseTime(balanceTimeRaw),
        filename: (filenameRaw.toLowerCase() === 'n/a' || filenameRaw === '') ? 'N/A' : filenameRaw,
    };
}

