import { db } from "../firebase";
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { type SupportRequest } from "../types/supportRequest";
import { generateNextId } from "../services/counterService";
import type { RequestStatus } from "../types/constants";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createSupportRequest = async (data: Omit<SupportRequest, 'uid' | 'status' | 'createdAt'>): Promise<void> => {
    try {
        const nextId = 'R' + String(await generateNextId('request'));
        await setDoc(doc(db, 'supportRequests', nextId), { ...data, uid: nextId, status: 'Pending', createdAt: serverTimestamp});
    } catch (error) {
        console.error('Error creating support request: ', error);
        throw new Error('Failed to create support request: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get support request by uid
export const getSupportRequest = async (uid: string): Promise<SupportRequest | null> => {
    try {
        const request = await getDoc(doc(db, 'supportRequests', uid));
        if (!request.exists()) return null;
        return request.data() as SupportRequest;
    } catch (error) {
        console.error('Error fetching support request: ', error);
        throw new Error('Failed to retrieve support request: ' + error);
    }
}

// Get support requests by student
export const getSupportRequestsByStudent = async (studentId: string, byVolunteer: boolean): Promise<SupportRequest[]> => {
    try {
        const q = (byVolunteer)
            ? query(collection(db, 'supportRequests'), where('volunteerId', '==', studentId))
            : query(collection(db, 'supportRequests'), where('seekerId', '==', studentId));
        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as SupportRequest));
    } catch (error) {
        console.error('Error fetching support requests: ', error);
        throw new Error('Failed to retrieve support requests: ' + error);
    }
}

// Get support requests by student
export const getSupportRequestsByStudentAndStatus = async (studentId: string, byVolunteer: boolean, status: RequestStatus): Promise<SupportRequest[]> => {
    try {
        const q = (byVolunteer)
            ? query(collection(db, 'supportRequests'), where('volunteerId', '==', studentId), where('status', '==', status))
            : query(collection(db, 'supportRequests'), where('seekerId', '==', studentId), where('status', '==', status));
        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as SupportRequest));
    } catch (error) {
        console.error('Error fetching support requests: ', error);
        throw new Error('Failed to retrieve support requests: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

// Update request data
export const updateSupportRequest = async (uid: string, newData: Partial<Omit<SupportRequest, 'uid' | 'status'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'supportRequests', uid), newData);
    } catch (error) {
        console.error('Error updating support request: ', error);
        throw new Error('Failed to update support request: ' + error);
    }
}

// Cancel request

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteSupportRequest = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'supportRequests', uid));
    } catch (error) {
        console.error('Error deleting support request: ', error);
        throw new Error('Failed to delete support request: ' + error);
    }
}