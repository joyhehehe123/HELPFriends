import { db } from '../firebase';
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type User } from '../types/user';

// ─── Create ────────────────────────────────────────────────────────────────────

export const createUser = async (uid: string, data: Omit<User, 'uid'>): Promise<void> => {
    try {
        await setDoc(doc(db, 'users', uid), { ...data, uid: uid });
    } catch (error) {
        console.error('Error creating user: ', error);
        throw new Error('Failed to create user: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get user by uid
export const getUser = async (uid: string): Promise<User | null> => {
    try {
        const user = await getDoc(doc(db, 'users', uid));
        if (!user.exists()) return null;
        return (user.data() as User);
    } catch (error) {
        console.error('Error fetching user: ', error);
        throw new Error('Failed to retrieve user: ' + error);
    }
}

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs[0].data() as User;
    } catch (error) {
        console.error('Error fetching user by email: ', error);
        throw new Error('Failed to retrieve user by email: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

// Update user data
export const updateUser = async (uid: string, newData: Partial<Omit<User, 'uid' | 'isVolunteer'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'users', uid), newData);
    } catch (error) {
        console.error('Error updating user: ', error);
        throw new Error('Failed to update user: ' + error);
    }
}

// Enable/disable volunteer status
export const updateVolunteerStatus = async (uid: string): Promise<void> => {
    try {
        const user = await getUser(uid);
        if (!user) throw new Error('No user found');
        await updateDoc(doc(db, 'users', uid), { isVolunteer: !user.isVolunteer });
    } catch (error) {
        console.error('Error updating volunteer status: ', error);
        throw new Error('Failed to update volunteer status: ' + error);
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteUser = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
        console.error('Error deleting user: ', error);
        throw new Error('Failed to delete user: ' + error);
    }
}