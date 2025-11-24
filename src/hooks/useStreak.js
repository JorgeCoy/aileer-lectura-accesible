import { useState, useEffect } from 'react';

/**
 * Hook to track daily usage streak.
 * Logic:
 * - Stores 'streak' (count) and 'lastVisit' (date string) in localStorage.
 * - On mount:
 *   - If lastVisit is today: do nothing.
 *   - If lastVisit is yesterday: increment streak.
 *   - If lastVisit is older: reset streak to 1.
 *   - If no lastVisit: set streak to 1.
 */
const useStreak = () => {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const today = new Date().toLocaleDateString();
        const storedStreak = parseInt(localStorage.getItem('streak') || '0', 10);
        const lastVisit = localStorage.getItem('lastVisit');

        if (!lastVisit) {
            // First visit ever
            setStreak(1);
            localStorage.setItem('streak', '1');
            localStorage.setItem('lastVisit', today);
        } else if (lastVisit === today) {
            // Already visited today
            setStreak(storedStreak);
        } else {
            // Check if yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toLocaleDateString();

            if (lastVisit === yesterdayString) {
                // Streak continues
                const newStreak = storedStreak + 1;
                setStreak(newStreak);
                localStorage.setItem('streak', newStreak.toString());
                localStorage.setItem('lastVisit', today);
            } else {
                // Streak broken
                setStreak(1);
                localStorage.setItem('streak', '1');
                localStorage.setItem('lastVisit', today);
            }
        }
    }, []);

    return streak;
};

export default useStreak;
