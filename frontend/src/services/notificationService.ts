import { db } from '../firebase';
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore";
import { type Notification } from '../types/notification';
import { generateNextId } from './counterService';

// ─── Create ────────────────────────────────────────────────────────────────────

export const createNotification = async (data: Omit<Notification, 'uid' | 'isRead' | 'createdAt'>): Promise<void> => {
    try {
        const nextId = 'N' + String(await generateNextId('notification'));
        await setDoc(doc(db, 'notifications', nextId), { ...data, uid: nextId, isRead: false, createdAt: Timestamp.now() });
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
export const getNotificationByUser = async (userId: string): Promise<Notification[]> => {
    try {
        const q = query(collection(db, 'notifications'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as Notification));
    } catch (error) {
        console.error('Error fetching notifications: ', error);
        throw new Error('Failed to retrieve notifications: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateNotification = async (uid: string, newData: Partial<Omit<Notification, 'uid' | 'isRead'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'notifications', uid), newData);
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