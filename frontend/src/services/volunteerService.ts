import { db } from "../firebase";
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type Volunteer } from "../types/volunteer";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createVolunteer = async (uid: string, data: Omit<Volunteer, 'volunteerId' | 'rating' | 'ratingCount'>): Promise<void> => {
    try {
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        for (const availability of data.availability) {
            for (const timeSlot of availability.timeSlots) {
                if (!timeRegex.test(timeSlot.startTime)) throw new Error(`Invalid start time: ${timeSlot.startTime}`);
                if (!timeRegex.test(timeSlot.endTime)) throw new Error(`Invalid end time: ${timeSlot.endTime}`);
            }
        }
        await setDoc(doc(db, 'volunteers', uid), {...data, volunteerid: uid, rating: 0.0, ratingCount: 0});
    } catch (error) {
        console.error('Error creating volunteer: ', error);
        throw new Error('Failed to create volunteer: ' + error);
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────────

// Get volunteer by uid
export const getVolunteer = async (uid: string): Promise<Volunteer | null> => {
    try {
        const volunteer = await getDoc(doc(db, 'volunteers', uid));
        if (!volunteer.exists()) return null;
        return volunteer.data() as Volunteer;
    } catch (error) {
        console.error('Error fetching volunteer: ', error);
        throw new Error('Failed to retrieve volunteer: ' + error);
    }
}

// ─── Update ────────────────────────────────────────────────────────────────────

// Update volunteer data
export const updateVolunteer = async (uid: string, newData: Partial<Omit<Volunteer, 'volunteerId' | 'rating' | 'isActive' | 'availability'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'volunteers', uid), newData);
    } catch (error) {
        console.error('Error updating volunteer: ', error);
        throw new Error('Failed to update volunteer: ' + error);
    }
}

// Update volunteer rating
export const updateVolunteerRating = async (uid: string, rating)

// Update rating count
export const addRatingCount = async (uid: string, )

// Change volunteer active status
export const updateVolunteerActiveStatus = async (uid: string, isActive: boolean): Promise<void> => {
    try {
        await updateDoc(doc(db, 'volunteers', uid), { isActive: !isActive });
    } catch (error) {
        console.error('Error updating volunteer active status: ', error);
        throw new Error('Failed to update volunteer active status: ' + error);
    }
}

// Update volunteer availability


// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteVolunteer = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'volunteers', uid));
    } catch (error) {
        console.error('Error deleting volunteer: ', error);
        throw new Error('Failed to delete volunteer: ' + error);
    }
}