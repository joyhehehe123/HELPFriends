import { db } from "../firebase";
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type SupportSession } from "../types/supportSession";
import { type SessionStatus } from "../types/constants";
import { type SupportRequest } from "../types/supportRequest";
import { generateNextId } from "./counterService";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createSupportSession = async (request: SupportRequest, data: Pick<SupportSession, 'dateTime' | 'duration'>): Promise<void> => {
    try {
        const nextId = 'S' + String(await generateNextId('session'));
        await setDoc(doc(db, 'supportSessions', nextId), { 
            ...data, 
            uid: nextId,
            category: request.category,
            title: request.title,
            description: request.description,
            supportMode: request.supportMode,
            status: 'Active',
            requestId: request.uid,
            seekerId: request.seekerId,
            volunteerId: request.volunteerId
        });
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
export const getSupportSessionsByStudent = async (studentId: string, byVolunteer: boolean): Promise<SupportSession[]> => {
    try {
        const q = (byVolunteer)
            ? query(collection(db, 'supportSessions'), where('volunteerId', '==', studentId))
            : query(collection(db, 'supportSessions'), where('seekerId', '==', studentId))

        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as SupportSession));
    } catch (error) {
        console.error('Error fetching support sessions: ', error);
        throw new Error('Failed to retrieve support sessions: ' + error);
    }
}

// Get support sessions of a student
export const getSupportSessionsByStudentAndStatus = async (studentId: string, byVolunteer: boolean, status: SessionStatus): Promise<SupportSession[]> => {
    try {
        const q = (byVolunteer)
            ? query(collection(db, 'supportSessions'), where('volunteerId', '==', studentId), where('status', '==', status))
            : query(collection(db, 'supportSessions'), where('seekerId', '==', studentId), where('status', '==', status))

        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as SupportSession));
    } catch (error) {
        console.error('Error fetching support sessions by status: ', error);
        throw new Error('Failed to retrieve support sessions by status: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

// Update date time or duration only
export const updateSupportSession = async (uid: string, newData: Partial<Pick<SupportSession, 'dateTime' | 'duration' | 'status'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'supportSessions', uid), newData);
    } catch (error) {
        console.error('Error updating support session: ', error);
        throw new Error('Failed to update support session: ' + error);
    }
}

// Cancel session

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteSupportSession = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'supportSessions', uid));
    } catch (error) {
        console.error('Error deleting support session: ', error);
        throw new Error('Failed to delete support session: ' + error);
    }
}