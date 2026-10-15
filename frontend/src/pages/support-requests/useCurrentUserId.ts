import { useEffect, useState } from 'react';
import { onAuthChange } from '../../services/authService';

// Uid of the logged-in user, or null
export default function useCurrentUserId(): string | null {
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => onAuthChange((user) => setUserId(user?.uid ?? null)), []);
    return userId;
}
