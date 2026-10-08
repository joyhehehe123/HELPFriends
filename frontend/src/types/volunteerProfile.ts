import { type User } from './user';
import { type Volunteer } from './volunteer';

export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface AvailabilityTimeSlot {
    start: string; // Format: "HH:mm" (24-hour)
    end: string;   // Format: "HH:mm" (24-hour)
}

export interface DayAvailability {
    day: DayName;
    timeSlots: AvailabilityTimeSlot[];
}

/**
 * Everything the volunteer matching screens show about one volunteer.
 * Firestore has no joins, so this combines the `users/{uid}` document (name, faculty, bio, ...)
 * with the `volunteers/{uid}` document (skills, availability, rating, ...).
 */
export type VolunteerProfile =
    Pick<User, 'fullName' | 'studentId' | 'faculty' | 'program' | 'bio' | 'profilePic'> &
    Pick<Volunteer, 'volunteerId' | 'preferredMode' | 'rating' | 'isActive' | 'supportCategories' | 'skills'> & {
        availability: DayAvailability[];
    };
