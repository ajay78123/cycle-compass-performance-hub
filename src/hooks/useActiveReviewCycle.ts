import { useState, useEffect } from 'react';
import { getReviewCycles, getReviewWindows } from '@/services/reviewCycleService';
import { ReviewCycle, ReviewWindow } from '@/types';

interface ActiveReviewCycle {
  cycle: (ReviewCycle & { windows?: ReviewWindow[] }) | null;
  isLoading: boolean;
  error: string | null;
}

export const useActiveReviewCycle = (): ActiveReviewCycle => {
  const [cycle, setCycle] = useState<(ReviewCycle & { windows?: ReviewWindow[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        const cycles = await getReviewCycles();
        const activeCycle = cycles.find((c) => c.status === 'Open');
        if (activeCycle) {
          const windows = await getReviewWindows(activeCycle.id);
          setCycle({ ...activeCycle, windows });
        } else {
          setCycle(null);
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch active review cycle');
        setIsLoading(false);
      }
    };
    fetchActiveCycle();
  }, []);

  return { cycle, isLoading, error };
};