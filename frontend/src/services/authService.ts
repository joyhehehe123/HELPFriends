import { auth } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    type User as AuthUser
} from "firebase/auth";

// ─── Sign Up ─────────────────────────────────────────────────────────────────────

export const signUp = async (email: string, password: string): Promise<AuthUser> => {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        return credential.user;
    } catch (error) {
        console.error('Error signing up: ', error);
        throw new Error('Failed to sign up: ' + error);
    }
}

// ─── Login ───────────────────────────────────────────────────────────────────────

export const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
    } catch (error) {
        console.error('Error logging in: ', error);
        throw new Error('Failed to log in: ' + error);
    }
}

// ─── Logout ──────────────────────────────────────────────────────────────────────

export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error logging out: ', error);
        throw new Error('Failed to log out: ' + error);
    }
}

// ─── Reset Password ──────────────────────────────────────────────────────────────

export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Error resetting password: ', error);
        throw new Error('Failed to reset password: ' + error);
    }
}

// ─── Get Current User ───────────────────────────────────────────────────────────

export const getCurrentUser = async (): Promise<AuthUser | null> => {
    return auth.currentUser
}

// ─── Listen for Auth State Changes ─────────────────────────────────────────────

export const onAuthChange = (callback: (user: AuthUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, callback);
};