export interface Feedback {
    feedbackId: string;
    rating: number;
    comments?: string;
    sessionId: string; // Reference to the associated SupportSession
}