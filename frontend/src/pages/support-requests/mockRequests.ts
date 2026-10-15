import mrBalls from '../../assets/mrballs.jpg';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { type PersonSummary, type SupportRequestRecord } from './types';

// Logged-in student until login is connected
export const MOCK_CURRENT_USER: PersonSummary = { userId: 'mock-me', fullName: 'Mr. Balls', profilePic: mrBalls };

const WAKA_WAKA: PersonSummary = { userId: 'mock-waka', fullName: 'Waka Waka', profilePic: null };
const NIKKI: PersonSummary = { userId: 'mock-nikki', fullName: 'Nikki', profilePic: null };
const JIN: PersonSummary = { userId: 'mock-jin', fullName: 'Jin', profilePic: null };
const HELLA: PersonSummary = { userId: 'mock-hella', fullName: 'Hella', profilePic: null };
// Another student with the same name, for a received request
const MR_BALLS_SEEKER: PersonSummary = { userId: 'mock-mr-balls', fullName: 'Mr. Balls', profilePic: mrBalls };

// Date from today, so the test dates never get old
export const daysFromToday = (days: number, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hours, minutes, 0, 0);
    return date;
};

// Test data until Firestore is connected
export const createMockRequests = (): SupportRequestRecord[] => [
    {
        requestId: 'R1012',
        category: 'Academic',
        supportTitle: 'Python Tutorial Continuation',
        description: 'I would like to continue the Python tutorial on loops and functions',
        supportMode: 'Virtual',
        proposedTimeSlots: [daysFromToday(3, '13:00'), daysFromToday(3, '15:30'), daysFromToday(4, '10:00')],
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Pending',
        createdAt: daysFromToday(-1, '10:20'),
        seeker: MOCK_CURRENT_USER,
        volunteer: WAKA_WAKA,
    },
    {
        requestId: 'R1009',
        category: 'Academic',
        supportTitle: 'Python Tutorial',
        description: 'I would like to have a short Python tutorial',
        supportMode: 'Virtual',
        proposedTimeSlots: [daysFromToday(5, '13:00'), daysFromToday(5, '15:30'), daysFromToday(6, '10:00')],
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Accepted',
        createdAt: daysFromToday(-6, '13:25'),
        respondedAt: daysFromToday(-6, '14:12'),
        seeker: MOCK_CURRENT_USER,
        volunteer: WAKA_WAKA,
    },
    {
        requestId: 'R1004',
        category: 'Technology',
        supportTitle: 'Python Tutorial',
        description: 'I would like to have a short Python tutorial',
        supportMode: 'Virtual',
        proposedTimeSlots: [daysFromToday(6, '13:00'), daysFromToday(6, '15:30'), daysFromToday(7, '10:00')],
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Rejected',
        createdAt: daysFromToday(-10, '11:00'),
        respondedAt: daysFromToday(-9, '16:45'),
        seeker: MOCK_CURRENT_USER,
        volunteer: NIKKI,
    },
    {
        requestId: 'R1013',
        category: 'Academic',
        supportTitle: 'Python Tutorial',
        description: 'I would like to have a short Python tutorial',
        supportMode: 'Virtual',
        proposedTimeSlots: [daysFromToday(2, '13:00'), daysFromToday(2, '15:30'), daysFromToday(3, '10:00')],
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Pending',
        createdAt: daysFromToday(-1, '08:40'),
        seeker: MR_BALLS_SEEKER,
        volunteer: MOCK_CURRENT_USER,
    },
    {
        requestId: 'R1010',
        category: 'Academic',
        supportTitle: 'Math Tutorial',
        description: 'Could you help me revise calculus before my quiz?',
        supportMode: 'Virtual',
        proposedTimeSlots: [daysFromToday(4, '11:00'), daysFromToday(5, '14:00')],
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Accepted',
        createdAt: daysFromToday(-5, '19:10'),
        respondedAt: daysFromToday(-4, '08:15'),
        seeker: JIN,
        volunteer: MOCK_CURRENT_USER,
    },
    {
        requestId: 'R1005',
        category: 'Technology',
        supportTitle: 'HELP Email Access',
        description: "I can't log in to my student email on my phone",
        supportMode: 'Virtual',
        proposedTimeSlots: [daysFromToday(-6, '13:00'), daysFromToday(-5, '10:00'), daysFromToday(-3, '14:00')],
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Rejected',
        createdAt: daysFromToday(-9, '12:30'),
        respondedAt: daysFromToday(-8, '10:05'),
        seeker: HELLA,
        volunteer: MOCK_CURRENT_USER,
    },
];
