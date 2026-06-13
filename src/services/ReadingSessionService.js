/**
 * Service to handle offline storage of reading sessions.
 * Follows the "Offline-First" strategy.
 */

const STORAGE_KEY = 'aleer_offline_sessions';

const ReadingSessionService = {
    /**
     * Save a completed session.
     * @param {Object} sessionData - { studentId, textId, wpm, duration, timestamp, comprehensionScore }
     */
    saveSession: (sessionData) => {
        try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const newSession = {
                ...sessionData,
                id: crypto.randomUUID(),
                synced: false,
                timestamp: new Date().toISOString()
            };

            existing.push(newSession);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

            console.log('✅ Session saved offline:', newSession);
            return newSession;
        } catch (error) {
            console.error('❌ Error saving offline session:', error);
            return null;
        }
    },

    /**
     * Get all unsynced sessions.
     */
    getUnsynced: () => {
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return all.filter(s => !s.synced);
        } catch (error) {
            return [];
        }
    },

    /**
     * Mark sessions as synced (after successful upload).
     * @param {Array<string>} sessionIds 
     */
    markAsSynced: (sessionIds) => {
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const updated = all.map(s =>
                sessionIds.includes(s.id) ? { ...s, synced: true } : s
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error marking sessions as synced:', error);
        }
    },

    /**
     * Get stats for the student dashboard.
     */
    getStats: () => {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return {
            totalSessions: all.length,
            totalTime: all.reduce((acc, s) => acc + (s.duration || 0), 0),
            avgWpm: all.length > 0 ? Math.round(all.reduce((acc, s) => acc + (s.wpm || 0), 0) / all.length) : 0
        };
    }
};

export default ReadingSessionService;
