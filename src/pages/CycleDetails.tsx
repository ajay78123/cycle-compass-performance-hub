import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExportData: React.FC = () => {
  const navigate = useNavigate();
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      // Placeholder: Call export service when implemented
      // await exportReviewData(format);
      alert(`Exporting data as ${format.toUpperCase()} (placeholder)`);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Export Review Data</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Export Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')}
            className="border rounded p-2"
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Export
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Back to Dashboard
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default ExportData;