import { db } from '../firebase';
import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore";
import { type Notification } from '../types/notification';

// ─── Create ────────────────────────────────────────────────────────────────────

export const createNotification = async (data: Omit<Notification, 'notificationId' | 'isRead' | 'createdAt'>): Promise<void> => {
    try {
        const docRef = await addDoc(collection(db, 'notifications'), { ...data, isRead: false, createdAt: Timestamp.now() });
        await updateNotification(docRef.id, { notificationId: docRef.id });
    } catch (error) {
        console.error('Error creating notification: ', error);
        throw new Error('Failed to create notification: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get notification by uid
export const getNotification = async (uid: string): Promise<Notification | null> => {
    try {
        const notification = await getDoc(doc(db, 'notifications', uid));
        if (!notification.exists()) return null;
        return notification.data() as Notification;
    } catch (error) {
        console.error('Error fetching notification: ', error);
        throw new Error('Failed to retrieve notification: ' + error);
    }
}

// Get notifications by user
export const getNotificationByUser = async (userId: string): Promise<Notification[] | null> => {
    try {
        const q = query(collection(db, 'notifications'), where('userId', '==', userId));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs.map(doc => (doc.data() as Notification));
    } catch (error) {
        console.error('Error fetching notifications: ', error);
        throw new Error('Failed to retrieve notifications: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateNotification = async (uid: string, data: Partial<Notification>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'notifications', uid), data);
    } catch (error) {
        console.error('Error updating notification: ', error);
        throw new Error('Failed to update notification: ' + error);
    }
}

export const markNotificationAsRead = async (uid: string): Promise<void> => {
    try {
        await updateDoc(doc(db, 'notifications', uid), { isRead: true });
    } catch (error) {
        console.error('Error updating notification: ', error);
        throw new Error('Failed to update notification: ' + error);
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteNotification = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'notifications', uid));
    } catch (error) {
        console.error('Error deleting notification: ', error);
        throw new Error('Failed to delete notification: ' + error);
    }
}