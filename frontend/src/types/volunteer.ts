import { 
    type PreferredMode, 
    type SupportCategory, 
    type Day 
} from "./constants";

export interface TimeSlot {
    start: string; // Format: "HH:mm"
    end: string; // Format: "HH:mm"
}

export interface Volunteer {
    uid: string; // Same as the userId
    preferredMode: PreferredMode;
    rating: number;
    isActive: boolean;
    supportCategories: SupportCategory[];
    skills: string[];
    availability: {
        day: Day; // Day of the week (e.g. Monday)
        timeSlots: TimeSlot[];
    }[];
}