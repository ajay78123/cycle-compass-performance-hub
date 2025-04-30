import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReviewCycles, getReviewWindows } from '@/services/reviewCycleService';
import { ReviewCycle, ReviewWindow } from '@/types';

const ReviewCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [windows, setWindows] = useState<{ [cycleId: string]: ReviewWindow[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cyclesData = await getReviewCycles();
        setCycles(cyclesData);
        const windowsData: { [cycleId: string]: ReviewWindow[] } = {};
        for (const cycle of cyclesData) {
          windowsData[cycle.id] = await getReviewWindows(cycle.id);
        }
        setWindows(windowsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load review calendar');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Review Calendar</h1>
      <div className="space-y-6">
        {cycles.length > 0 ? (
          cycles.map((cycle) => (
            <div key={cycle.id} className="border p-4 rounded">
              <h2
                className="text-lg font-semibold cursor-pointer"
                onClick={() => navigate(`/cycles/${cycle.id}`)}
              >
                {cycle.name}
              </h2>
              <p>
                {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                {new Date(cycle.endDate).toLocaleDateString()}
              </p>
              <p>Status: {cycle.status}</p>
              <div className="mt-2">
                <h3 className="font-medium">Review Windows</h3>
                {windows[cycle.id]?.length > 0 ? (
                  <ul>
                    {windows[cycle.id].map((window) => (
                      <li key={window.id}>
                        {window.label}: {new Date(window.openDate).toLocaleDateString()} -{' '}
                        {new Date(window.closeDate).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No review windows</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No review cycles found</p>
        )}
        <button
          onClick={() => navigate('/cycles/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create New Cycle
        </button>
      </div>
    </div>
  );
};

export default ReviewCalendar;