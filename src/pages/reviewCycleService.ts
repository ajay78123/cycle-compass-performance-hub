import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReviewCycle, closeReviewCycle, getReviewWindows } from '@/services/reviewCycleService';
import { ReviewCycle, ReviewWindow } from '@/types';

const CycleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<ReviewCycle | null>(null);
  const [windows, setWindows] = useState<ReviewWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCycleData = async () => {
      if (!id) {
        setError('Invalid cycle ID');
        setLoading(false);
        return;
      }
      try {
        const cycleData = await getReviewCycle(id);
        const windowsData = await getReviewWindows(id);
        setCycle(cycleData);
        setWindows(windowsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cycle details');
        setLoading(false);
      }
    };
    fetchCycleData();
  }, [id]);

  const handleCloseCycle = async () => {
    if (!id) return;
    try {
      await closeReviewCycle(id);
      setCycle((prev) => prev ? { ...prev, status: 'Closed' } : null);
      navigate('/cycles');
    } catch (err) {
      setError('Failed to close cycle');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!cycle) return <div>No cycle found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{cycle.name}</h1>
      <div className="space-y-4">
        <p><strong>Start Date:</strong> {new Date(cycle.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(cycle.endDate).toLocaleDateString()}</p>
        <p><strong>Frequency:</strong> {cycle.frequency}</p>
        <p><strong>Status:</strong> {cycle.status}</p>
        <div>
          <h2 className="text-lg font-semibold">Review Windows</h2>
          {windows.length > 0 ? (
            <ul>
              {windows.map((window) => (
                <li key={window.id}>
                  {window.label}: {new Date(window.openDate).toLocaleDateString()} -{' '}
                  {new Date(window.closeDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No review windows found</p>
          )}
        </div>
        {cycle.status === 'Open' && (
          <button
            onClick={handleCloseCycle}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Close Cycle
          </button>
        )}
        <button
          onClick={() => navigate('/cycles')}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Back to Cycles
        </button>
      </div>
    </div>
  );
};

export default CycleDetails;