export interface User {
    uid: string;
    email: string;
    fullName: string;
    studentId: string;
    isVolunteer: boolean;
    faculty: string | null; // Users can choose to not provide faculty information
    program: string | null; // Users can choose to not provide program information
    bio: string | null;
    profilePic: string | null;
}