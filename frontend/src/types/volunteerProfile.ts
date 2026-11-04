import { type User } from './user';
import { type Volunteer } from './volunteer';

export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface AvailabilityTimeSlot {
    start: string; 
    end: string; 
}

export interface DayAvailability {
    day: DayName;
    timeSlots: AvailabilityTimeSlot[];
}

export type VolunteerProfile =
    Pick<User, 'fullName' | 'studentId' | 'faculty' | 'program' | 'bio'> &
    Pick<Volunteer, 'preferredMode' | 'rating' | 'isActive' | 'supportCategories' | 'skills'> & {
        volunteerId: string; // Volunteer document id (same as the user id)
        availability: DayAvailability[];
    };