import { db } from "../firebase";
import { collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { type TimeSlot, type Volunteer } from "../types/volunteer";
import { getRatedSessions } from './supportSessionService';
import { getFeedback } from "./feedbackService";
import { type PreferredMode } from "../types/constants";
import { DAYS } from '../types/constants';

// ─── Create ────────────────────────────────────────────────────────────────────

export const createVolunteer = async (uid: string, data: Omit<Volunteer, 'volunteerId' | 'rating'>): Promise<void> => {
    try {
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        for (const availability of data.availability) {
            for (const timeSlot of availability.timeSlots) {
                if (!timeRegex.test(timeSlot.start)) throw new Error(`Invalid start time: ${timeSlot.start}`);
                if (!timeRegex.test(timeSlot.end)) throw new Error(`Invalid end time: ${timeSlot.end}`);
            }
        }
        await setDoc(doc(db, 'volunteers', uid), {...data, volunteerid: uid, rating: 0.0});
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
        if (startDate > endDate) throw new Error('Start date must not later than end date');

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
export const getVolunteersBySkills = async (skills: ): Promise<Volunteer[]> => {
    try {

    } catch (error) {
        console.error('Error fetching volunteers by skills: ', error);
        throw new Error('Failed to retrieve volunteers by skills: ' + error);
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
export const updateVolunteerRating = async (uid: string): Promise<void> => {
    try {
        const ratedSessions = await getRatedSessions(uid);
        var totalRating = 0;
        if (ratedSessions) {
            for (const session of ratedSessions) {
                const feedback = await getFeedback(session.sessionId);
                if (feedback) totalRating += feedback.rating;
            }
            await updateDoc(doc(db, 'volunteers', uid), { rating: totalRating / ratedSessions.length });
        }
    } catch (error) {
        console.error('Error updating volunteer\'s rating: ', error);
        throw new Error('Failed to update volunteer\'s rating: ' + error);
    }
}

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
export const updateVolunteerAvailability = async (uid: string, day: string, timeSlots: TimeSlot[]): Promise<void> => {
    try {
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        for (const { start, end } of timeSlots) {
            if (!timeRegex.test(start)) throw new Error(`Invalid start time: ${start}`);
            if (!timeRegex.test(end)) throw new Error(`Invalid end time: ${end}`);
            if (start >= end) throw new Error('Start time must not later that end time');
        }
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