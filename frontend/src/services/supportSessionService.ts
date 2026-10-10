import { db } from "../firebase";
import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type SupportSession } from "../types/supportSession";
import { getFeedbackBySession } from "./feedbackService";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createSupportSession = async (data: Omit<SupportSession, 'sessionId'>): Promise<void> => {
    try {
        const docRef = await addDoc(collection(db, 'supportSessions'), data);
        await updateSupportSession(docRef.id, { sessionId: docRef.id} );
    } catch (error) {
        console.error('Error creating support session: ', error);
        throw new Error('Failed to create support session: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get support session by uid (doc id)
export const getSupportSession = async (uid: string): Promise<Omit<SupportSession, 'sessionId'> | null> => {
    try {
        const supportSession = await getDoc(doc(db, 'supportSessions', uid));
        if (!supportSession.exists()) return null;
        return supportSession.data() as SupportSession;
    } catch (error) {
        console.error('Error fetching support session: ', error);
        throw new Error('Failed to retrieve support session: ' + error);
    }
}

// Get support sessions by student and status
export const getStudentSupportSessionsByStatus = async (studentId: string, status: string): Promise<SupportSession[]> => {
    try {
        const q = query(collection(db, 'supportSessions'), where('studentId', '==', studentId), where('status', '==', status));
        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as SupportSession));
    } catch (error) {
        console.error('Error fetching support sessions: ', error);
        throw new Error('Failed to retrieve support sessions: ' + error);
    }
}

// Get support sessions by volunteer and status
export const getVolunteerSupportSessionsByStatus = async (volunteerId: string, status: string): Promise<SupportSession[]> => {
    try {
        const q = query(collection(db, 'supportSessions'), where('volunteerId', '==', volunteerId), where('status', '==', status));
        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as SupportSession));
    } catch (error) {
        console.error('Error fetching support sessions: ', error);
        throw new Error('Failed to retrieve support sessions: ' + error);
    }
}

// Check if completed session is rated
export const isSessionRated = async (sessionId: string): Promise<boolean> => {
    try {
        const feedback = await getFeedbackBySession(sessionId);
        return !!feedback;
    } catch (error) {
        console.error('Error checking if session is rated: ', error);
        throw new Error('Failed to check if session is rated: ' + error);
    }
}

// Get rated completed sessions
export const getRatedSessions = async (uid: string): Promise<SupportSession[]> => {
    try {
        const completedSessions = await getVolunteerSupportSessionsByStatus(uid, 'Completed');
        if (!completedSessions) return completedSessions;
        const ratedSessions = [];
        for (const session of completedSessions) {
            if (await isSessionRated(session.sessionId)) ratedSessions.push(session);
        }
        return ratedSessions;
    } catch (error) {
        console.error('Error fetching completed sessions with ratings: ', error);
        throw new Error('Failed to retrieve completed sessions with ratings: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateSupportSession = async (uid: string, newData: Partial<SupportSession>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'supportSessions', uid), newData);
    } catch (error) {
        console.error('Error updating support session: ', error);
        throw new Error('Failed to update support session: ' + error);
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteSupportSession = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'supportSessions', uid));
    } catch (error) {
        console.error('Error deleting support session: ', error);
        throw new Error('Failed to delete support session: ' + error);
    }
}