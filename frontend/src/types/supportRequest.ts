import { Timestamp } from 'firebase/firestore';

export interface SupportRequest {
    uid: string;
    category: 'Academic' | 'Technology' | 'New Student' | 'General Student';
    supportTitle: string;
    description: string;
    supportMode: 'Virtual' | 'Physical';
    proposedTimeSlots: Timestamp[];
    status: 'pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Scheduled';
    cancelReason?: string;
    studentId: string; // Reference to the student who created the support request
    volunteerId?: string; // Reference to the volunteer who accepted the support request
}