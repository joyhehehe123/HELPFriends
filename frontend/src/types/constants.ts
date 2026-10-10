export type PreferredMode = 'Virtual' | 'Physical' | 'Both';
export type SupportCategory = 'Academic' | 'Technology' | 'New Student' | 'General Student';
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export type Day = typeof DAYS[number];
export type SupportMode = 'Virtual' | 'Physical';
export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Scheduled';
export type SessionStatus = 'Active' | 'Completed' | 'Cancelled';
export type NotificationCategory = 'Support Request' | 'Support Session' | 'Feedback' | 'General';
