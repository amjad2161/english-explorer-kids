import { useState, useEffect, useCallback } from "react";
import { checkAchievements, Achievement } from "@/lib/achievements";

/**
 * Hook that checks for new achievements after every route change / game action.
 * Returns the current achievement to display as toast.
 */
export const useAchievementChecker = () => {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  const runCheck = useCallback(() => {
    const newlyUnlocked = checkAchievements();
    if (newlyUnlocked.length > 0) {
      setQueue(prev => [...prev, ...newlyUnlocked]);
    }
  }, []);

  // Show next in queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [current, queue]);

  const dismiss = useCallback(() => {
    setCurrent(null);
  }, []);

  return { current, dismiss, runCheck };
};
