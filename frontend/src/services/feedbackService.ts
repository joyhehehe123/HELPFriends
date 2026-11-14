import { db } from '../firebase';
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { type Feedback } from "../types/feedback";
import { generateNextId } from './counterService';
import { createNotification } from './notificationService';
import { getSupportSession } from './supportSessionService';
import { getUser } from './userService';

// ─── Create ────────────────────────────────────────────────────────────────────

export const createFeedback = async (data: Omit<Feedback, 'uid' | 'createdAt'>): Promise<void> => {
    try {
        const nextId = 'F' + String(await generateNextId('feedback'));
        await setDoc(doc(db, 'feedbacks', nextId), { ...data, uid: nextId, createdAt: serverTimestamp() });

    } catch (error) {
        console.error('Error creating feedback: ', error);
        throw new Error('Failed to create feedback: ' + error);
    }

    try {
        const session = await getSupportSession(data.sessionId);
        if (!session) return;

        const seeker = await getUser(session?.seekerId ?? "");

        await createNotification({
            title: "Feedback Received",
            message: `You have received a feedback from ${seeker?.fullName ?? "unknown user"} for the support session "${session.title}".`,
            category: "Feedback",
            userId: session?.volunteerId,
            referenceId: data.sessionId
        })
    } catch (error) {
        console.error('Error generating notification for created feedback: ', error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get feedback by uid (doc id)
export const getFeedback = async (uid: string): Promise<Feedback | null> => {
    try {
        const feedback = await getDoc(doc(db, 'feedbacks', uid));
        if (!feedback.exists()) return null;
        return feedback.data() as Feedback;
    } catch (error) {
        console.error('Error fetching feedback: ', error);
        throw new Error('Failed to retrieve feedback: ' + error);
    }
}

// Get feedback by session id
export const getFeedbackBySession = async (sessionId: string): Promise<Feedback | null> => {
    try {
        const q = query(collection(db, 'feedbacks'), where('sessionId', '==', sessionId));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs[0].data() as Feedback;
    } catch (error) {
        console.error('Error fetching feedback: ', error);
        throw new Error('Failed to retrieve feedback: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateFeedback = async (uid: string, newData: Partial<Omit<Feedback, 'uid' | 'createdAt'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'feedbacks', uid), newData);

        const feedback = await getFeedback(uid);
        if (!feedback) return;

        const session = await getSupportSession(feedback?.sessionId ?? "");
        if (!session) return;

        const seeker = await getUser(session?.seekerId ?? "");
        await createNotification({
            title: "Feedback Updated",
            message: `The feedback for support session "${feedback?.sessionId}" has been updated by ${seeker?.fullName ?? "unknown user"}.`,
            category: "Feedback",
            userId: session?.volunteerId,
            referenceId: feedback.sessionId
        });
    } catch (error) {
        console.error('Error updating feedback: ', error);
        throw new Error('Failed to update feedback: ' + error);
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteFeedback = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'feedbacks', uid));
    } catch (error) {
        console.error('Error deleting feedback: ', error);
        throw new Error('Failed to delete feedback: ' + error);
    }
}