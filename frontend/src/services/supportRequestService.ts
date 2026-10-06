import { db } from "../firebase";
import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type SupportRequest } from "../types/supportRequest";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createSupportRequest = async (data: Omit<SupportRequest, 'requestId'>): Promise<void> => {
    try {
        if (data.studentId == data.volunteerId) throw new Error('Student and volunteer cannot be the same person');
        const docRef = await addDoc(collection(db, 'supportRequests'), data);
        await updateSupportRequest(docRef.id, { requestId: docRef.id });
    } catch (error) {
        console.error('Error creating support request: ', error);
        throw new Error('Failed to create support request: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get support request by uid (doc id)
export const getSupportRequest = async (uid: string): Promise<SupportRequest | null> => {
    try {
        const supportRequest = await getDoc(doc(db, 'supportRequests', uid));
        if (!supportRequest.exists()) return null;
        return supportRequest.data() as SupportRequest;
    } catch (error) {
        console.error('Error fetching support request: ', error);
        throw new Error('Failed to retrieve support request: ' + error);
    }
}

// Get support requests by student
export const getSupportRequestByStudent = async (studentId: string): Promise<SupportRequest[] | null> => {
    try {
        const q = query(collection(db, 'supportRequests'), where('studentId', '==', studentId));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs.map(doc => (doc.data() as SupportRequest));
    } catch (error) {
        console.error('Error fetching support requests: ', error);
        throw new Error('Failed to retrieve support requests: ' + error);
    }
}

// Get support requests by volunteer
export const getSupportRequestByVolunteer = async (volunteerId: string): Promise<SupportRequest[] | null> => {
    try {
        const q = query(collection(db, 'supportRequests'), where('volunteerid', '==', volunteerId));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs.map(doc => (doc.data() as SupportRequest));
    } catch (error) {
        console.error('Error fetching support requests: ', error);
        throw new Error('Failed to retrieve support requests: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateSupportRequest = async (uid: string, newData: Partial<Omit<SupportRequest, 'requestId'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'supportRequests', uid), newData);
    } catch (error) {
        console.error('Error updating support request: ', error);
        throw new Error('Failed to update support request: ' + error);
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteSupportRequest = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'supportRequests', uid));
    } catch (error) {
        console.error('Error deleting support request: ', error);
        throw new Error('Failed to delete support request: ' + error);
    }
}