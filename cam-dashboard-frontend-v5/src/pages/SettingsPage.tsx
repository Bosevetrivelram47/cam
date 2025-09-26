// src/pages/SettingsPage.tsx
import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Application Settings</h2>
      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <p className="text-gray-700">
          This is where you'll manage application-wide settings, user preferences,
          API keys, data retention policies, or notification configurations.
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-700 space-y-2">
            <li>User Profile Management</li>
            <li>Notification Preferences</li>
            <li>Data Export/Import Options</li>
            <li>API Integrations</li>
            <li>Theme Customization (Dark Mode toggle)</li>
        </ul>
        <button className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200">
            Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;