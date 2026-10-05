export interface Volunteer {
    uid: string; // Same as the user's uid, used to link the volunteer to their user account
    preferredMode: 'Virtual' | 'Physical' | 'Both';
    rating: number;
    isActive: boolean;
    supportCategories: ('Academic' | 'Technology' | 'New Student' | 'General Student')[];
    skills: string[];
    availability: {
        day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
        timeSlots: {
            startTime: string; // Format: "HH:mm"
            endTime: string;   // Format: "HH:mm"
        }[];
    }[];
}