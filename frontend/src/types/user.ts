export interface User {
    uid: string;
    email: string;
    fullName: string;
    isVolunteer: boolean;
    studentId: string;
    faculty: string;
    program: string;
    bio?: string;
    profilePic: string; // Placeholder will be used if the user hasn't uploaded a profile picture
}