export interface Volunteer {
    volunteerId: string; // Same as the userId
    preferredMode: 'Virtual' | 'Physical' | 'Both';
    rating: number;
    ratingCount: number; // Used to calculate rating
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