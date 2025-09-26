// src/components/MachineTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { MachineData } from '../types/MachineData'; // Ensure Machine interface is imported

interface MachineTableProps {
    machines: MachineData[];
    onEdit?: (machine: MachineData) => void;
    onDelete?: (id: string) => void;
}

const MachineTable: React.FC<MachineTableProps> = ({ machines, onEdit, onDelete }) => {
    if (!machines || machines.length === 0) {
        return <p>No machines found. Add a new one!</p>;
    }

    // Helper function to determine row background color based on status
    const getRowBackgroundColor = (status: MachineData['status']): string => {
        switch (status) {
            case 'Running':
                return '#e8f5e9'; // Light Green
            case 'Maintenance':
                return '#fffde7'; // Light Yellow
            case 'Stopped':
                return '#ffebee'; // Light Red
            default:
                return '#ffffff'; // Default White
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="machine table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Job Type</TableCell>
                        <TableCell align="right">Temp (°C)</TableCell>
                        <TableCell align="right">Pressure (PSI)</TableCell>
                        <TableCell>Last Updated</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {machines.map((machine) => (
                        <TableRow
                            key={machine.id}
                            // Apply background color based on status
                            sx={{ backgroundColor: getRowBackgroundColor(machine.status) }}
                        >
                            <TableCell component="th" scope="row">
                                {machine.id}
                            </TableCell>
                            <TableCell>{machine.name}</TableCell>
                            <TableCell>{machine.classId}</TableCell>
                            <TableCell>{machine.status}</TableCell>
                            <TableCell>{machine.jobType || 'N/A'}</TableCell>
                            <TableCell align="right">{machine.temperature}</TableCell>
                            <TableCell align="right">{machine.pressure}</TableCell>
                            <TableCell>{new Date(machine.lastUpdated).toLocaleString()}</TableCell>
                            <TableCell>
                                {onEdit && <button onClick={() => onEdit(machine)}>Edit</button>}
                                {onDelete && <button onClick={() => onDelete(machine.id)}>Delete</button>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default MachineTable;