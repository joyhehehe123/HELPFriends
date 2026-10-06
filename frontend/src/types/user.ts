export interface User {
    userId: string;
    email: string;
    fullName: string;
    studentId: string;
    isVolunteer: boolean;
    faculty?: string; // Users can choose to not provide faculty information
    program?: string; // Users can choose to not provide program information
    bio?: string;
    profilePic: string; // Placeholder will be used if the user hasn't uploaded a profile picture
}