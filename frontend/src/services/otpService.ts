import emailjs from '@emailjs/browser';

import {
    EMAILJS_SERVICE_ID,
    EMAILJS_PUBLIC_KEY,
    LOGIN_TEMPLATE_ID
} from '../config/emailjs';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

interface PendingOtp {
    code: string;
    expiresAt: number;
    attempts: number;
}

// Temporary in-memory storage
let pendingOtp: PendingOtp | null = null;

// Generate a random 6-digit OTP
const generateOtp = (): string => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);

    return String(100000 + (array[0] % 900000));
};

// Send OTP through EmailJS
export const sendLoginOtp = async (
    email: string,
    name: string
): Promise<boolean> => {
    const otp = generateOtp();

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            LOGIN_TEMPLATE_ID,
            {
                to_email: email,
                to_name: name,
                passcode: otp,
                time: 5
            },
            {
                publicKey: EMAILJS_PUBLIC_KEY
            }
        );

        pendingOtp = {
            code: otp,
            expiresAt: Date.now() + OTP_EXPIRY_MS,
            attempts: 0
        };

        return true;

    } catch (error) {
        console.error('Failed to send login OTP:', error);
        return false;
    }
};

// Verify OTP
export const verifyLoginOtp = (enteredOtp: string): boolean => {
    if (!pendingOtp) {
        return false;
    }

    if (Date.now() > pendingOtp.expiresAt) {
        pendingOtp = null;
        return false;
    }

    if (pendingOtp.attempts >= MAX_OTP_ATTEMPTS) {
        pendingOtp = null;
        return false;
    }

    pendingOtp.attempts++;

    if (enteredOtp !== pendingOtp.code) {
        return false;
    }

    pendingOtp = null;
    return true;
};

// Clear OTP
export const clearLoginOtp = (): void => {
    pendingOtp = null;
};