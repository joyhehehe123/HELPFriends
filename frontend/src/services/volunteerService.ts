import { db } from "../firebase";
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, runTransaction } from "firebase/firestore";
import { getSupportSessionsByStudentAndStatus } from './supportSessionService';
import { getFeedback } from "./feedbackService";
import { type PreferredMode, DAYS } from "../types/constants";
import type { TimeSlot, Volunteer } from "../types/volunteer";

// ─── Create ────────────────────────────────────────────────────────────────────

export const createVolunteer = async (uid: string, data: Omit<Volunteer, 'uid' | 'rating' | 'isActive'>): Promise<void> => {
    try {
        await setDoc(doc(db, 'volunteers', uid), {...data, uid: uid, rating: 0.0, isActive: true}); // Volunteer will have same uid as linked user uid
    } catch (error) {
        console.error('Error creating volunteer: ', error);
        throw new Error('Failed to create volunteer: ' + error);
    }
}

export const registerVolunteer = async (
    uid: string,
    data: Omit<Volunteer, 'uid' | 'rating' | 'isActive'>,
): Promise<void> => {
    try {
        const volunteerRef = doc(db, 'volunteers', uid);
        const userRef = doc(db, 'users', uid);
        await runTransaction(db, async (transaction) => {
            const existingVolunteer = await transaction.get(volunteerRef);
            if (existingVolunteer.exists()) {
                throw new Error('A volunteer profile already exists for this account.');
            }

            transaction.set(volunteerRef, {
                ...data,
                uid,
                rating: 0,
                isActive: true,
            } satisfies Volunteer);
            transaction.update(userRef, { isVolunteer: true });
        });
    } catch (error) {
        console.error('Error registering volunteer: ', error);
        throw new Error('Failed to register as a volunteer: ' + error, { cause: error });
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

// Get volunteer by preferred mode
export const getVolunteersByPreferredMode = async (preferredMode: PreferredMode): Promise<Volunteer[]> => {
    try {
        const q = query(collection(db, 'volunteers'), where('preferredMode', 'in', [preferredMode, 'Both']));
        const snap = await getDocs(q);
        return snap.docs.map(doc => (doc.data() as Volunteer));
    } catch (error) {
        console.error('Error fetching volunteer by preferred mode: ', error);
        throw new Error('Failed to retrieve volunteer by preferred mode: ' + error);
    }
}

// Get all volunteers
export const getAllVolunteers = async (): Promise<Volunteer[]> => {
    try {
        const volunteers = await getDocs(collection(db, 'volunteers'));
        return volunteers.docs.map(doc => (doc.data() as Volunteer));
    } catch (error) {
        console.error('Error fetching volunteers: ', error);
        throw new Error('Failed to retrieve volunteers: ' + error);
    }
}

// Get volunteer between availability date range
export const getAvailableVolunteersBetweenDateRange = async (startDate: Date, endDate: Date): Promise<Volunteer[]> => {
    try {
        const days = Math.round((+endDate - +startDate) / (1000 * 60 * 60 * 24));
        const volunteers = await getAllVolunteers();
        if (volunteers && days >= 7) return volunteers

        const start = startDate.getDay();
        const end = endDate.getDay();
        const matchedVolunteers: Volunteer[] = [];

        if (volunteers) {
            for (const volunteer of volunteers) {
                const availableDays = volunteer.availability.map((a) => a.day);
                const availableDaysNum = availableDays.map((d) => DAYS.indexOf(d));
                for (const num of availableDaysNum) {
                    if ((start == end && days == 0) && (num == start)) {
                        matchedVolunteers.push(volunteer);
                        break;
                    } else if (start < end && (num >= start && num <= end)) {
                        matchedVolunteers.push(volunteer);
                        break;
                    } else if (start > end && (num >= start || num <= end )) {
                        matchedVolunteers.push(volunteer);
                        break;
                    }
                }
            }
        }
        return matchedVolunteers;
    } catch (error) {
        console.error(`Error fetching volunteer between ${startDate} and ${endDate}: `, error);
        throw new Error(`Failed to retrieve volunteer between ${startDate} and ${endDate}: ` + error);
    }
}

// Get volunteers by skills


// ─── Update ────────────────────────────────────────────────────────────────────

// Update volunteer data
export const updateVolunteer = async (uid: string, newData: Partial<Omit<Volunteer, 'uid' | 'rating'>>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'volunteers', uid), newData);
    } catch (error) {
        console.error('Error updating volunteer: ', error);
        throw new Error('Failed to update volunteer: ' + error);
    }
}

// Update volunteer rating
export const updateVolunteerRating = async (uid: string): Promise<void> => {
    try {
        const completedSession = await getSupportSessionsByStudentAndStatus(uid, true, 'Completed');
        let totalRating = 0;
        let ratingCount = 0;
        if (completedSession) {
            for (const session of completedSession) {
                const feedback = await getFeedback(session.uid);
                if (feedback) {
                    totalRating += feedback.rating;
                    ratingCount++;
                }
            }
            await updateDoc(doc(db, 'volunteers', uid), { rating: totalRating / ratingCount });
        }
    } catch (error) {
        console.error('Error updating volunteer\'s rating: ', error);
        throw new Error('Failed to update volunteer\'s rating: ' + error);
    }
}

// Change volunteer active status
export const updateVolunteerActiveStatus = async (uid: string): Promise<void> => {
    try {
        const volunteer = await getVolunteer(uid);
        if (!volunteer) throw new Error('No volunteer found');
        await updateDoc(doc(db, 'volunteers', uid), { isActive: !volunteer.isActive });
    } catch (error) {
        console.error('Error updating volunteer active status: ', error);
        throw new Error('Failed to update volunteer active status: ' + error);
    }
}

// Update volunteer availability
export const updateVolunteerAvailability = async (uid: string, day: string, timeSlots: TimeSlot[]): Promise<void> => {
    try {
        await updateDoc(doc(db, 'volunteers', uid), { [`availability.${day}`]: timeSlots });
    } catch (error) {
        console.error('Error updating volunteer availability: ', error);
        throw new Error('Failed to update volunteer availability: ' + error);
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteVolunteer = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'volunteers', uid));
    } catch (error) {
        console.error('Error deleting volunteer: ', error);
        throw new Error('Failed to delete volunteer: ' + error);
    }
}