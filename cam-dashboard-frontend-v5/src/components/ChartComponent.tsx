// src/components/ChartComponent.tsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataItem } from '../types/MachineData';

interface ChartProps {
  title: string;
  data: ChartDataItem[];
  type: 'daily' | 'weekly' | 'monthly';
}

const ChartComponent: React.FC<ChartProps> = ({ title, data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        <h4 className="text-lg font-semibold mb-3">{title}</h4>
        <p>No data available for this chart.</p>
      </div>
    );
  }

  const chartMargin = { top: 20, right: 30, left: 20, bottom: 5 };

  if (type === 'daily') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{title} (Jobs & Time Taken)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Time Taken (min)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              formatter={(value, name) => [`${name === 'value' ? 'Jobs' : 'Time Taken'}: ${name === 'timeTaken' ? value + ' min' : value}`, name]}
              labelFormatter={(label) => `Job: ${label}`}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="value" name="Jobs Completed" fill="#8884d8" barSize={30} radius={[5, 5, 0, 0]} />
            <Bar yAxisId="right" dataKey="timeTaken" name="Time Taken (min)" fill="#82ca9d" barSize={30} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } else { // Weekly or Monthly
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{title} (Jobs & Runtime)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#ffc658" label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Total Runtime (Hrs)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              formatter={(value, name) => [`${name === 'value' ? 'Jobs' : 'Runtime'}: ${name === 'runtimeHours' ? value + ' Hrs' : value}`, name]}
              labelFormatter={(label) => `${type === 'weekly' ? 'Day' : 'Period'}: ${label}`}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="value" name="Jobs Completed" stroke="#ffc658" activeDot={{ r: 8 }} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="runtimeHours" name="Total Runtime (Hrs)" stroke="#82ca9d" activeDot={{ r: 8 }} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
};

export default ChartComponent;