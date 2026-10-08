import type { SignupInfoData } from './SignupSteps/signup';

// Placeholder endpoints: adjust the URLs/payloads to match your backend,
// or move these into your existing services/api file.
const API_BASE = '/api/auth';

async function post(path: string, body: unknown): Promise<void> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let message = 'The request failed.';
        try {
            const data = await response.json();
            message = data.message ?? message;
        } catch {
            // ignore body parse errors
        }
        throw new Error(message);
    }
}

export function requestSignupOtp(info: SignupInfoData): Promise<void> {
    return post('/signup', info);
}

export function verifySignupOtp(email: string, otp: string): Promise<void> {
    return post('/verify-otp', { email, otp });
}

export function setSignupPassword(info: SignupInfoData, otp: string, password: string): Promise<void> {
    return post('/set-password', { ...info, otp, password });
}