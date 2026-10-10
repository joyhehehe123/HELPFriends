import { db } from "../firebase";
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type SupportSession } from "../types/supportSession";
import { generateNextId } from "./counterService";
import { getSupportRequestsByStudent } from "./supportRequestService";
import type { SessionStatus } from "../types/constants";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createSupportSession = async (data: Omit<SupportSession, 'uid'>): Promise<void> => {
    try {
        const nextId = 'S' + String(await generateNextId('session'));
        await setDoc(doc(db, 'supportSessions', nextId), { ...data, uid: nextId });
    } catch (error) {
        console.error('Error creating support session: ', error);
        throw new Error('Failed to create support session: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get support session by uid
export const getSupportSession = async (uid: string): Promise<SupportSession | null> => {
    try {
        const supportSession = await getDoc(doc(db, 'supportSessions', uid));
        if (!supportSession.exists()) return null;
        return supportSession.data() as SupportSession;
    } catch (error) {
        console.error('Error fetching support session: ', error);
        throw new Error('Failed to retrieve support session: ' + error);
    }
}

// Get support sessions of a student
export const getStudentSupportSessions = async (studentId: string, byVolunteer: boolean): Promise<SupportSession[]> => {
    try {
        const requests = (byVolunteer) 
            ? await getSupportRequestsByStudent(studentId, true) 
            : await getSupportRequestsByStudent(studentId, false);
        const sessions: SupportSession[] = [];
        for (const request of requests) {
            const q = query(collection(db, 'supportSessions'), where('requestId', '==', request.uid));
            const snap = await getDocs(q);
            if (!snap.empty) sessions.push(snap.docs[0].data() as SupportSession);
        }
        return sessions;
    } catch (error) {
        console.error('Error fetching support sessions: ', error);
        throw new Error('Failed to retrieve support sessions: ' + error);
    }
}

// Get support sessions of a student
export const getStudentSupportSessionsByStatus = async (studentId: string, byVolunteer: boolean, status: SessionStatus): Promise<SupportSession[]> => {
    try {
        const requests = (byVolunteer) 
            ? await getSupportRequestsByStudent(studentId, true) 
            : await getSupportRequestsByStudent(studentId, false);
        const sessions: SupportSession[] = [];
        for (const request of requests) {
            const q = query(collection(db, 'supportSessions'), where('requestId', '==', request.uid), where('status', '==', status));
            const snap = await getDocs(q);
            if (!snap.empty) sessions.push(snap.docs[0].data() as SupportSession);
        }
        return sessions;
    } catch (error) {
        console.error('Error fetching support sessions by status: ', error);
        throw new Error('Failed to retrieve support sessions by status: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateSupportSession = async (uid: string, newData: Partial<Omit<SupportSession, 'uid'>>): Promise<void> => {
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