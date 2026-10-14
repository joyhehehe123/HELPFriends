import { type User } from './user';
import { type Volunteer } from './volunteer';

export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface AvailabilityTimeSlot {
    start: string; // Format: "HH:mm"
    end: string; // Format: "HH:mm"
}

export interface DayAvailability {
    day: DayName;
    timeSlots: AvailabilityTimeSlot[];
}

// User + Volunteer data for the matching page (Firestore has no joins)
export type VolunteerProfile =
    Pick<User, 'fullName' | 'studentId' | 'faculty' | 'program' | 'bio' | 'profilePic'> &
    Pick<Volunteer, 'preferredMode' | 'rating' | 'isActive' | 'supportCategories' | 'skills'> & {
        volunteerId: string; // Volunteer document id (same as the user id)
        availability: DayAvailability[];
    };
