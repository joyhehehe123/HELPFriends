export interface Feedback {
    uid: string;
    rating: number;
    comments: string | null;
    sessionId: string; // Reference to the associated SupportSession
}