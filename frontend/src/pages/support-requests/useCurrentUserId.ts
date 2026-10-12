import { useEffect, useState } from 'react';
import { onAuthChange } from '../../services/authService';

// Logged-in user's uid, or null (pages use the mock user until login is connected)
// TODO: use the team's auth hook when login is ready
export default function useCurrentUserId(): string | null {
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => onAuthChange((user) => setUserId(user?.uid ?? null)), []);
    return userId;
}
