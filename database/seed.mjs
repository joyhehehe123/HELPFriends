import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const key = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(key)});

const db = getFirestore();
const auth = getAuth();

const ts = (date) => Timestamp.fromDate(new Date(date));
const HALF_HOUR = 30 * 60_000;
const minutesFromNow = (m) => {
    const target = Date.now() + m * 60_000;
    return Timestamp.fromDate(new Date(Math.round(target / HALF_HOUR) * HALF_HOUR));
};
const printTime = (d) => {
    const date = d.toDate();
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};
const printDate = (d) => {
    const date = d.toDate();
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const users = [
    {
        email: "B2300486@helplive.edu.my",
        fullName: "Joy Lau Xuan",
        studentId: "B2300486",
        isVolunteer: true,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Computer Science (Honours)",
        bio: "I love hamster"
    },
    {
        email: "B2400423@helplive.edu.my",
        fullName: "Kim Ga-In",
        studentId: "B2400423",
        isVolunteer: false,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Information Technology (Honours)",
        bio: null
    },
    {
        email: "B2300490@helplive.edu.my",
        fullName: "Adrinn Awi Goo",
        studentId: "B2300490",
        isVolunteer: true,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Information Technology (Honours)",
        bio: "I love donuts"
    },
    {
        email: "B2401344@helplive.edu.my",
        fullName: "Puteri A\'isyah",
        studentId: "B2401344",
        isVolunteer: false,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Computer Science (Honours)",
        bio: "I love sushi"
    },
    {
        email: "B2401411@helplive.edu.my",
        fullName: "Sophea Natasha",
        studentId: "B2401411",
        isVolunteer: true,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Information Technology in Data Analytics (Honours)",
        bio: "I love winston"
    },
    {
        email: "B2600001@helplive.edu.my",
        fullName: "Iden Geffephuc",
        studentId: "B2600001",
        isVolunteer: true,
        faculty: "Faculty of Behavioral Sciences",
        program: "Bachelor of Psychology (Honours)",
        bio: "Psychology is my passion, will help you with your mental health and well-being."
    },
    {
        email: "B2600002@helplive.edu.my",
        fullName: "Iem Ghuey",
        studentId: "B2600002",
        isVolunteer: true,
        faculty: "Faculty of Behavioral Sciences",
        program: "Bachelor of Psychology (Honours)",
        bio: "Psychology student~ Feel free to look for me if you need psychological help~"
    },
    {
        email: "B2600003@helplive.edu.my",
        fullName: "Shettel Pheccup",
        studentId: "B2600003",
        isVolunteer: true,
        faculty: "Faculty of Business, Economics, and Accounting",
        program: "Bachelor in Accounting (Honours)",
        bio: "Account student. Find me if you want to balance your books and accounts (or your life hehehe)."
    },
    {
        email: "B2600004@helplive.edu.my",
        fullName: "Anita Napp",
        studentId: "B2600004",
        isVolunteer: true,
        faculty: "Faculty of Business, Economics, and Accounting",
        program: "Bachelor of Business (Finance) (Honours)",
        bio: "Finance student. I can help you with your financial planning, especially for independent students like me."
    },
    {
        email: "B2600005@helplive.edu.my",
        fullName: "Hugh R. Dumm",
        studentId: "B2600005",
        isVolunteer: true,
        faculty: "Faculty of Business, Economics, and Accounting",
        program: "Bachelor of Economics (Honours)",
        bio: "Economics pro with CGPA 4.0. Look for me if you need to know anything about economics."
    }
]

const volunteers = [
    {
        fullName: "Joy Lau Xuan",
        preferredMode: "Virtual",
        rating: 4.5,
        isActive: true,
        supportCategories: ["Academic", "Technology", "New Student", "General Student"],
        skills: ["Programming", "Mathematics"],
        availability: [
            {
                day: "Monday",
                timeSlots: [
                    {start: "10:00", end: "12:00"},
                    {start: "13:00", end: "17:00"}
                ]
            },
            {
                day: "Friday",
                timeSlots: [
                    {start: "09:00", end: "18:00"}
                ]
            }
        ]
    },
    {
        fullName: "Adrinn Awi Goo",
        preferredMode: "Physical",
        rating: 4.8,
        isActive: true,
        supportCategories: ["Technology", "New Student", "General Student"],
        skills: ["Problem Solving", "Software Configuration", "Communication"],
        availability: [
            {
                day: "Friday",
                timeSlots: [
                    {start: "14:00", end: "17:00"}
                ]
            }
        ]
    },
    {
        fullName: "Sophea Natasha",
        preferredMode: "Both",
        rating: 4.5,
        isActive: true,
        supportCategories: ["Academic", "Technology", "New Student", "General Student"],
        skills: ["Programming", "Mathematics", "Problem Solving", "Study Techiques", "Communication"],
        availability: [
            {
                day: "Thursday",
                timeSlots: [
                    {start: "09:00", end: "11:00"},
                    {start: "12:30", end: "14:00"},
                    {start: "17:00", end: "18:00"}
                ]
            },
            {
                day: "Friday",
                timeSlots: [
                    {start: "13:00", end: "16:00"}
                ]
            }
        ]
    },
    {
        fullName: "Iden Geffephuc",
        preferredMode: "Virtual",
        rating: 4.7,
        isActive: true,
        supportCategories: ["New Student", "General Student"],
        skills: ["Problem-Solving", "Stress Management", "Communication"],
        availability: [
            {
                day: "Monday",
                timeSlots: [
                    {start: "08:00", end: "10:00"},
                    {start: "16:30", end: "18:00"}
                ]
            },
            {
                day: "Wednesday",
                timeSlots: [
                    {start: "09:00", end: "11:00"},
                    {start: "15:00", end: "18:00"}
                ]
            }
        ]
    },
    {
        fullName: "Iem Ghuey",
        preferredMode: "Both",
        rating: 4.6,
        isActive: true,
        supportCategories: ["Academic", "New Student", "General Student"],
        skills: ["Stress Management", "Communication", "Psychological Support", "Social Psychology"],
        availability: [
            {
                day: "Tuesday",
                timeSlots: [
                    {start: "16:00", end: "20:00"}
                ]
            },
            {
                day: "Wednesday",
                timeSlots: [
                    {start: "10:00", end: "12:00"}
                ]
            }
        ]
    },
    {
        fullName: "Shettel Pheccup",
        preferredMode: "Virtual",
        rating: 4.6,
        isActive: true,
        supportCategories: ["Academic", "General Student"],
        skills: ["Accounting", "Finance", "Statistics"],
        availability: [
            {
                day: "Saturday",
                timeSlots: [
                    {start: "16:00", end: "18:00"}
                ]
            },
            {
                day: "Sunday",
                timeSlots: [
                    {start: "19:00", end: "21:00"}
                ]
            }
        ]
    },
    {
        fullName: "Anita Napp",
        preferredMode: "Both",
        rating: 4.6,
        isActive: true,
        supportCategories: ["Academic", "General Student", "New Student"],
        skills: ["Finance", "Statistics", "Mathematics", "Business Concepts"],
        availability: [
            {
                day: "Friday",
                timeSlots: [
                    {start: "09:00", end: "12:00"},
                    {start: "16:00", end: "19:00"}
                ]
            }
        ]
    },
    {
        fullName: "Hugh R. Dumm",
        preferredMode: "Both",
        rating: 4.6,
        isActive: true,
        supportCategories: ["Academic", "General Student"],
        skills: ["Economics Concepts", "Statistics", "Mathematics", "Time Management"],
        availability: [
            {
                day: "Thursday",
                timeSlots: [
                    {start: "09:00", end: "11:00"},
                    {start: "20:00", end: "23:00"}
                ]
            }
        ]
    }
]

const requests = [
    {
        uid: "R1001",
        category: "Academic",
        title: "Mobile Apps Tutorial",
        description: "Want to learn mobile apps",
        supportMode: "Physical",
        proposedTimeSlots: [
            ts("2026-11-02T14:00:00+08:00"),
            ts("2026-11-02T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-01T09:00:00+08:00"),
        respondedAt: ts("2026-11-01T10:30:00+08:00"),
        scheduledAt: ts("2026-11-02T14:00:00+08:00"),
        seekerName: "Joy Lau Xuan",
        volunteerName: "Adrinn Awi Goo"
    },
    {
        uid: "R1002",
        category: "Academic",
        title: "Algebra Revision",
        description: "I would like help revising algebra and solving practice questions.",
        supportMode: "Virtual",
        proposedTimeSlots: [
            ts("2026-11-09T10:00:00+08:00"),
            ts("2026-11-09T11:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-05T09:00:00+08:00"),
        respondedAt: ts("2026-11-05T09:30:00+08:00"),
        scheduledAt: ts("2026-11-05T10:00:00+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1003",
        category: "Academic",
        title: "Introduction to Programming",
        description: "I need help understanding basic programming concepts and writing simple programs.",
        supportMode: "Virtual",
        proposedTimeSlots: [
            ts("2026-11-09T13:00:00+08:00"),
            ts("2026-11-09T14:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-06T11:00:00+08:00"),
        respondedAt: ts("2026-11-06T11:30:00+08:00"),
        scheduledAt: ts("2026-11-06T12:00:00+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1004",
        category: "Academic",
        title: "Assignment Guidance",
        description: "Idk what I shud do for this assignment... my brain is empty",
        supportMode: "Virtual",
        proposedTimeSlots: [
            minutesFromNow(-100), // ts("2026-11-23T10:00:00+08:00"),
            minutesFromNow(-70)  // ts("2026-11-23T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-09T12:35:02+08:00"),
        respondedAt: ts("2026-11-09T13:11:11+08:00"),
        scheduledAt: ts("2026-11-09T13:30:00+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1005",
        category: "Technology",
        title: "Git and GitHub Setup",
        description: "I need help setting up Git and GitHub for my programming projects.",
        supportMode: "Virtual",
        proposedTimeSlots: [
            minutesFromNow(40), // ts("2026-11-16T14:00:00+08:00"),
            minutesFromNow(70) // ts("2026-11-16T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-10T10:00:00+08:00"),
        respondedAt: ts("2026-11-10T10:30:00+08:00"),
        scheduledAt: ts("2026-11-10T11:00:00+08:00"),
        seekerName: "Puteri A\'isyah",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1006",
        category: "Academic",
        title: "Math Tutorial",
        description: "I need help with this algebra thingy",
        supportMode: "Physical",
        proposedTimeSlots: [
            ts("2026-11-22T10:00:00+08:00"),
            ts("2026-11-22T17:00:00+08:00"),
            ts("2026-11-23T13:30:00+08:00")
        ],
        status: "Accepted",
        createdAt: ts("2026-11-10T10:27:57+08:00"),
        respondedAt: ts("2026-11-10T13:20:51+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Sophea Natasha"
    },
    {
        uid: "R1007",
        category: "General Student",
        title: "Managing Study Stress",
        description: "I would like someone to talk to about managing university workload and study stress.",
        supportMode: "Virtual",
        proposedTimeSlots: [
            minutesFromNow(300), // ts("2026-11-19T12:00:00+08:00"),
            minutesFromNow(330)  // ts("2026-11-19T13:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-11T09:00:00+08:00"),
        respondedAt: ts("2026-11-11T09:30:00+08:00"),
        scheduledAt: ts("2026-11-11T10:00:00+08:00"),
        seekerName: "Adrinn Awi Goo",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1008",
        category: "New Student",
        title: "Getting Used to University Life",
        description: "I would appreciate advice on adapting to university life and managing my timetable.",
        supportMode: "Virtual",
        proposedTimeSlots: [
            minutesFromNow(-50), // ts("2026-11-19T14:00:00+08:00"),
            minutesFromNow(-20)  // ts("2026-11-19T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-11T10:00:00+08:00"),
        respondedAt: ts("2026-11-11T10:30:00+08:00"),
        scheduledAt: ts("2026-11-11T11:00:00+08:00"),
        seekerName: "Puteri A\'isyah",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1009",
        category: "Technology",
        title: "Troubleshooting Development Tools",
        description: "I need help resolving issues with my programming development tools.",
        supportMode: "Virtual",
        proposedTimeSlots: [
            ts("2026-11-16T11:00:00+08:00"),
            ts("2026-11-16T12:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-11T11:30:00+08:00"),
        respondedAt: ts("2026-11-11T11:40:00+08:00"),
        scheduledAt: ts("2026-11-11T11:45:00+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1010",
        category: "Technology",
        title: "Github Installation",
        description: "I have some issues when installing GitHub",
        supportMode: "Physical",
        proposedTimeSlots: [
            ts("2026-11-16T14:00:00+08:00"),
            ts("2026-11-16T15:00:00+08:00")
        ],
        status: "Rejected",
        createdAt: ts("2026-11-11T11:57:02+08:00"),
        respondedAt: ts("2026-11-12T08:16:10+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Adrinn Awi Goo"
    },
    {
        uid: "R1011",
        category: "Academic",
        title: "Python Programming Tutorial",
        description: "I need help with this Python class thingy",
        supportMode: "Virtual",
        proposedTimeSlots: [
            ts("2026-11-23T10:00:00+08:00"),
            ts("2026-11-23T15:00:00+08:00"),
            ts("2026-11-27T15:00:00+08:00"),
        ],
        status: "Pending",
        createdAt: ts("2026-11-12T01:26:22+08:00"),
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "R1012",
        category: "Technology",
        title: "Delta Force Installation",
        description: "Can u help me to install delta force...hehe..hehe..hehe..",
        supportMode: "Physical",
        proposedTimeSlots: [
            ts("2026-11-16T14:00:00+08:00"),
            ts("2026-11-16T15:00:00+08:00")
        ],
        status: "Cancelled",
        createdAt: ts("2026-11-12T02:59:38+08:00"),
        cancelledAt: ts("2026-11-12T10:25:33+08:00"),
        cancelledReason: "I changed my mind and no longer need assistance with this request.",
        seekerName: "Kim Ga-In",
        volunteerName: "Adrinn Awi Goo"
    },
    {
        uid: "R1013",
        category: "Academic",
        title: "Mobile Apps Tutorial Continuation",
        description: "Want to continue learning mobile apps.",
        supportMode: "Physical",
        proposedTimeSlots: [
            ts("2026-11-30T14:00:00+08:00"),
            ts("2026-11-30T15:00:00+08:00"),
            ts("2026-11-30T16:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-11-18T15:00:00+08:00"),
        respondedAt: ts("2026-11-18T16:00:00+08:00"),
        scheduledAt: ts("2026-11-18T16:30:00+08:00"),
        seekerName: "Joy Lau Xuan",
        volunteerName: "Adrinn Awi Goo"
    }
];

const sessions = [
    {
        uid: "S1001",
        category: "Academic",
        title: "Mobile Apps Tutorial",
        description: "Want to learn mobile apps",
        supportMode: "Physical",
        dateTime: ts("2026-11-02T14:00:00+08:00"),
        duration: 60,
        status: "Completed",
        completedAt: ts("2026-11-02T15:30:00+08:00"),
        requestId: "R1001",
        seekerName: "Joy Lau Xuan",
        volunteerName: "Adrinn Awi Goo"
    },
    {
        uid: "S1002",
        category: "Academic",
        title: "Algebra Revision",
        description: "Revision of algebra concepts and practice questions.",
        supportMode: "Virtual",
        dateTime: ts("2026-11-09T10:00:00+08:00"),
        duration: 60,
        status: "Completed",
        completedAt: ts("2026-11-09T11:00:00+08:00"),
        requestId: "R1002",
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1003",
        category: "Academic",
        title: "Introduction to Programming",
        description: "Help with basic programming concepts and simple programs.",
        supportMode: "Virtual",
        dateTime: ts("2026-11-09T13:00:00+08:00"),
        duration: 60,
        status: "Completed",
        completedAt: ts("2026-11-09T14:00:00+08:00"),
        requestId: "R1003",
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1004",
        category: "Technology",
        title: "Git and GitHub Setup",
        description: "Help with setting up Git and GitHub for programming projects.",
        supportMode: "Virtual",
        dateTime: minutesFromNow(40), // ts("2026-11-16T14:00:00+08:00"),
        duration: 60,
        status: "Active",
        requestId: "R1005",
        seekerName: "Puteri A\'isyah",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1005",
        category: "General Student",
        title: "Managing Study Stress",
        description: "Discuss strategies for managing university workload and study stress.",
        supportMode: "Virtual",
        dateTime: minutesFromNow(300), // ts("2026-11-19T12:00:00+08:00"),
        duration: 60,
        status: "Active",
        requestId: "R1007",
        seekerName: "Adrinn Awi Goo",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1006",
        category: "New Student",
        title: "Getting Used to University Life",
        description: "Advice on adapting to university life and managing a timetable.",
        supportMode: "Virtual",
        dateTime: minutesFromNow(-20), // ts("2026-11-19T14:00:00+08:00"),
        duration: 60,
        status: "Active",
        requestId: "R1008",
        seekerName: "Puteri A\'isyah",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1007",
        category: "Technology",
        title: "Troubleshooting Development Tools",
        description: "Help with resolving programming development tool issues.",
        supportMode: "Virtual",
        dateTime: ts("2026-11-16T11:00:00+08:00"),
        duration: 60,
        status: "Cancelled",
        cancelledAt: ts("2026-11-12T03:30:00+08:00"),
        cancelledBy: "Joy Lau Xuan",
        cancelledReason: "The volunteer is unavailable at the scheduled time.",
        requestId: "R1009",
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1008",
        category: "Academic",
        title: "Assignment Guidance",
        description: "Idk what I shud do for this assignment... my brain is empty",
        supportMode: "Virtual",
        dateTime: minutesFromNow(-100), // ts("2026-11-23T15:00:00+08:00"),
        duration: 60,
        status: "Active",
        requestId: "R1004",
        seekerName: "Kim Ga-In",
        volunteerName: "Joy Lau Xuan"
    },
    {
        uid: "S1009",
        category: "Academic",
        title: "Mobile Apps Tutorial Continuation",
        description: "Want to continue learning mobile apps.",
        supportMode: "Physical",
        dateTime: ts("2026-11-30T15:00:00+08:00"),
        duration: 60,
        status: "Active",
        requestId: "R1013",
        seekerName: "Joy Lau Xuan",
        volunteerName: "Adrinn Awi Goo"
    }
];

const feedbacks = [
    {
        uid: "F1001",
        rating: 5,
        comments: "The session was super helpfulll",
        createdAt: ts("2026-11-09T12:30:00+08:00"),
        sessionId: "S1002"
    }
];

const notifications = [
    {
        uid: "N1001",
        title: "New Support Request",
        message: "You have received a new support request \"Mobile Apps Tutorial\" from Joy Lau Xuan. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-01T09:00:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "R1001"
    },
    {
        uid: "N1002",
        title: "Support Request Accepted",
        message: "Your support request \"Mobile Apps Tutorial\" has been accepted by Adrinn Awi Goo. You can now schedule a session with the volunteer.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-01T10:30:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1001"
    },
    {
        uid: "N1003",
        title: "Support Session Scheduled",
        message: "Your accepted support request \"Mobile Apps Tutorial\" has been scheduled on 2026-11-02 at 2:00 PM by Adrinn Awi Goo.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-01T14:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1001"
    },
    {
        uid: "N1004",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with volunteer Adrinn Awi Goo at 2:00 PM is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T12:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1001"
    },
    {
        uid: "N1005",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with volunteer Adrinn Awi Goo at 2:00 PM is starting in 15 minutes. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T13:45:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1001"
    },
    {
        uid: "N1006",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with volunteer Adrinn Awi Goo at 2:00 PM has started. Please be join the session now.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T14:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1001"
    },
    {
        uid: "N1007",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with support seeker Joy Lau Xuan at 2:00 PM is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T12:00:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "S1001"
    },
    {
        uid: "N1008",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with support seeker Joy Lau Xuan at 2:00 PM is starting in 15 minutes. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T13:45:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "S1001"
    },
    {
        uid: "N1009",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with support seeker Joy Lau Xuan at 2:00 PM has started. Please be join the session now.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T14:00:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "S1001"
    },
    {
        uid: "N1010",
        title: "Support Session Completed",
        message: "Your support session \"Mobile Apps Tutorial\" with Adrinn Awi Goo has been completed. You can now provide feedback for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-02T15:30:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1001"
    },

    {
        uid: "N1011",
        title: "New Support Request",
        message: "You have received a new support request \"Algebra Revision\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-05T09:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1002"
    },
    {
        uid: "N1012",
        title: "Support Request Accepted",
        message: "Your support request \"Algebra Revision\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-05T09:30:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "R1002"
    },
    {
        uid: "N1013",
        title: "Support Session Scheduled",
        message: "Support request \"Algebra Revision\" accepted by you has been scheduled on 2026-11-02 at 2:00 PM by Kim Ga-In.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-05T10:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1002"
    },
    {
        uid: "N1014",
        title: "Support Session Reminder",
        message: "Your support session \"Algebra Revision\" with volunteer Joy Lau Xuan at 10:00 AM is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T08:00:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1002"
    },
    {
        uid: "N1015",
        title: "Support Session Reminder",
        message: "Your support session \"Algebra Revision\" with volunteer Joy Lau Xuan at 10:00 AM is starting in 15 minutes. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T09:45:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1002"
    },
    {
        uid: "N1016",
        title: "Support Session Reminder",
        message: "Your support session \"Mobile Apps Tutorial\" with volunteer Joy Lau Xuan at 10:00 AM has started. Please be join the session now.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T10:00:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1002"
    },
    {
        uid: "N1017",
        title: "Support Session Reminder",
        message: "Your support session \"Algebra Revision\" with support seeker Kim Ga-In at 10:00 AM is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T08:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1002"
    },
    {
        uid: "N1018",
        title: "Support Session Reminder",
        message: "Your support session \"Algebra Revision\" with support seeker Kim Ga-In at 10:00 AM is starting in 15 minutes. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T09:45:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1002"
    },
    {
        uid: "N1019",
        title: "Support Session Reminder",
        message: "Your support session \"Algebra Revision\" with support seeker Kim Ga-In at 10:00 AM has started. Please be join the session now.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T10:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1002"
    },
    {
        uid: "N1020",
        title: "Support Session Completed",
        message: "Your support session \"Algebra Revision\" with Joy Lau Xuan has been completed. You can now provide feedback for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T11:00:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1002"
    },
    {
        uid: "N1021",
        title: "Feedback Received",
        message: "You have received feedback from Kim Ga-In for your support session \"Algebra Revision\".",
        category: "Feedback",
        isRead: false,
        createdAt: ts("2026-11-09T12:30:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "F1001"
    },

    {
        uid: "N1022",
        title: "New Support Request",
        message: "You have received a new support request \"Introduction to Programming\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-06T11:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1003"
    },
    {
        uid: "N1023",
        title: "Support Request Accepted",
        message: "Your support request \"Introduction to Programming\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-06T11:30:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "R1003"
    },
    {
        uid: "N1024",
        title: "Support Session Scheduled",
        message: "Support request  \"Introduction to Programming\" accepted by you has been scheduled on 2026-11-09 at 1:00 PM by Kim Ga-In.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T12:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1003"
    },
    {
        uid: "N1025",
        title: "Support Session Reminder",
        message: "Your support session \"Introduction to Programming\" with volunteer Joy Lau Xuan at 1:00 PM is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T11:00:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1003"
    },
    {
        uid: "N1026",
        title: "Support Session Reminder",
        message: "Your support session \"Introduction to Programming\" with volunteer Joy Lau Xuan at 1:00 PM is starting in 15 minutes. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T12:45:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1003"
    },
    {
        uid: "N1027",
        title: "Support Session Reminder",
        message: "Your support session \"Introduction to Programming\" with volunteer Joy Lau Xuan at 1:00 PM has started. Please be join the session now.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T13:00:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1003"
    },
    {
        uid: "N1028",
        title: "Support Session Reminder",
        message: "Your support session \"Introduction to Programming\" with support seeker Kim Ga-In at 1:00 PM is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T11:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1003"
    },
    {
        uid: "N1029",
        title: "Support Session Reminder",
        message: "Your support session \"Introduction to Programming\" with support seeker Kim Ga-In at 1:00 PM is starting in 15 minutes. Please be prepared for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T12:45:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1003"
    },
    {
        uid: "N1030",
        title: "Support Session Reminder",
        message: "Your support session \"Introduction to Programming\" with support seeker Kim Ga-In at 1:00 PM has started. Please be join the session now.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T13:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1003"
    },
    {
        uid: "N1031",
        title: "Support Session Completed",
        message: "Your support session \"Introduction to Programming\" with Joy Lau Xuan has been completed. You can now provide feedback for the session.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-09T14:00:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1003"
    },

    {
        uid: "N1032",
        title: "New Support Request",
        message: "You have received a new support request \"Assignment Guidance\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-09T12:35:02+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1004"
    },
    {
        uid: "N1033",
        title: "Support Request Accepted",
        message: "Your support request \"Assignment Guidance\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-06T13:11:11+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "R1004"
    },
    {
        uid: "N1034",
        title: "Support Session Scheduled",
        message: `Your accepted support request  \"Assignment Guidance\" has been scheduled on ${printDate(minutesFromNow(-100))} at ${printTime(minutesFromNow(-100))} by Joy Lau Xuan.`,
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-06T13:30:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1008"
    },
    {
        uid: "N1035",
        title: "Support Session Reminder",
        message: `Your support session \"Assignment Guidance\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(-100 - 120))} is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-100 - 120),
        receiver: "Kim Ga-In",
        referenceId: "S1008"
    },
    {
        uid: "N1036",
        title: "Support Session Reminder",
        message: `Your support session \"Assignment Guidance\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(-100 - 15))} is starting in 15 minutes. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-100 - 15),
        receiver: "Joy Lau Xuan",
        referenceId: "S1008"
    },
    {
        uid: "N1037",
        title: "Support Session Reminder",
        message: `Your support session \"Assignment Guidance\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(-100))} has started. Please be join the session now.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-100),
        receiver: "Joy Lau Xuan",
        referenceId: "S1008"
    },
    {
        uid: "N1038",
        title: "Support Session Reminder",
        message: `Your support session \"Assignment Guidance\" with support seeker Kim Ga-In at ${printTime(minutesFromNow(-100 - 120))} is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-100 - 120),
        receiver: "Joy Lau Xuan",
        referenceId: "S1008"
    },
    {
        uid: "N1039",
        title: "Support Session Reminder",
        message: `Your support session \"Assignment Guidance\" with support seeker Kim Ga-In at ${printTime(minutesFromNow(-115))} is starting in 15 minutes. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-100 - 15),
        receiver: "Joy Lau Xuan",
        referenceId: "S1008"
    },
    {
        uid: "N1040",
        title: "Support Session Reminder",
        message: `Your support session \"Assignment Guidance\" with support seeker Kim Ga-In at ${printTime(minutesFromNow(-100))} has started. Please be join the session now.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-100),
        receiver: "Joy Lau Xuan",
        referenceId: "S1008"
    },

    {
        uid: "N1041",
        title: "New Support Request",
        message: "You have received a new support request \"Git and GitHub Setup\" from Puteri A\'isyah. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-10T10:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1005"
    },
    {
        uid: "N1042",
        title: "Support Request Accepted",
        message: "Your support request \"Git and GitHub Setup\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-10T10:30:00+08:00"),
        receiver: "Puteri A\'isyah",
        referenceId: "R1005"
    },
    {
        uid: "N1043",
        title: "Support Session Scheduled",
        message: `Your accepted support request  \"Git and GitHub Setup\" has been scheduled on ${printDate(minutesFromNow(40))} at ${printTime(minutesFromNow(40))} by Joy Lau Xuan.`,
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-10T11:00:00+08:00"),
        receiver: "Puteri A\'isyah",
        referenceId: "S1004"
    },
    {
        uid: "N1044",
        title: "Support Session Reminder",
        message: `Your support session \"Git and GitHub Setup\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(40 - 120))} is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(40 - 120),
        receiver: "Puteri A\'isyah",
        referenceId: "S1004"
    },
    {
        uid: "N1045",
        title: "Support Session Reminder",
        message: `Your support session \"Git and GitHub Setup\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(40 - 15))} is starting in 15 minutes. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(40 - 15),
        receiver: "Puteri A\'isyah",
        referenceId: "S1004"
    },
    {
        uid: "N1046",
        title: "Support Session Reminder",
        message: `Your support session \"Git and GitHub Setup\" with support seeker Puteri A\'isyah at ${printTime(minutesFromNow(40 - 120))} is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(40 - 120),
        receiver: "Joy Lau Xuan",
        referenceId: "S1004"
    },
    {
        uid: "N1047",
        title: "Support Session Reminder",
        message: `Your support session \"Git and GitHub Setup\" with support seeker Puteri A\'isyah at ${printTime(minutesFromNow(40 - 15))} is starting in 15 minutes. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(40 - 15),
        receiver: "Joy Lau Xuan",
        referenceId: "S1004"
    },

    {
        uid: "N1048",
        title: "New Support Request",
        message: "You have received a new support request \"Math Tutorial\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-10T10:27:57+08:00"),
        receiver: "Sophea Natasha",
        referenceId: "S1006"
    },
    {
        uid: "N1049",
        title: "Support Request Accepted",
        message: "Your support request \"Math Tutorial\" has been accepted by Sophea Natasha. You can now schedule a session with the volunteer.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-10T13:20:51+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1006"
    },

    {
        uid: "N1050",
        title: "New Support Request",
        message: "You have received a new support request \"Managing Study Stress\" from Adrinn Awi Goo. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-11T09:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1007"
    },
    {
        uid: "N1051",
        title: "Support Request Accepted",
        message: "Your support request \"Managing Study Stress\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-11T09:30:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "R1007"
    },
    {
        uid: "N1052",
        title: "Support Session Scheduled",
        message: `Your accepted support request  \"Managing Study Stress\" has been scheduled on ${printDate(minutesFromNow(300))} at ${printTime(minutesFromNow(300))} by Joy Lau Xuan.`,
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-11T10:00:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "S1005"
    },

    {
        uid: "N1053",
        title: "New Support Request",
        message: "You have received a new support request \"Getting Used to University Life\" from Puteri A\'isyah. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-10T10:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1008"
    },
    {
        uid: "N1054",
        title: "Support Request Accepted",
        message: "Your support request \"Getting Used to University Life\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-10T10:30:00+08:00"),
        receiver: "Puteri A\'isyah",
        referenceId: "R1008"
    },
    {
        uid: "N1055",
        title: "Support Session Scheduled",
        message: `Your accepted support request  \"Getting Used to University Life\" has been scheduled on ${printDate(minutesFromNow(-20))} at ${printTime(minutesFromNow(-20))} by Joy Lau Xuan.`,
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-10T11:00:00+08:00"),
        receiver: "Puteri A\'isyah",
        referenceId: "S1006"
    },
    {
        uid: "N1056",
        title: "Support Session Reminder",
        message: `Your support session \"Getting Used to University Life\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(-20 - 120))} is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-20 - 120),
        receiver: "Puteri A\'isyah",
        referenceId: "S1006"
    },
    {
        uid: "N1057",
        title: "Support Session Reminder",
        message: `Your support session \"Getting Used to University Life\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(-20 - 15))} is starting in 15 minutes. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-20 - 15),
        receiver: "Puteri A\'isyah",
        referenceId: "S1006"
    },
    {
        uid: "N1058",
        title: "Support Session Reminder",
        message: `Your support session \"Getting Used to University Life\" with volunteer Joy Lau Xuan at ${printTime(minutesFromNow(-20))} has started. Please be join the session now.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-20),
        receiver: "Puteri A\'isyah",
        referenceId: "S1006"
    },
    {
        uid: "N1059",
        title: "Support Session Reminder",
        message: `Your support session \"Getting Used to University Life\" with support seeker Puteri A\'isyah at ${printTime(minutesFromNow(-20 - 120))} is starting in 2 hours. You can no longer cancel the session. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-20 - 120),
        receiver: "Joy Lau Xuan",
        referenceId: "S1006"
    },
    {
        uid: "N1060",
        title: "Support Session Reminder",
        message: `Your support session \"Getting Used to University Life\" with support seeker Puteri A\'isyah at ${printTime(minutesFromNow(-20 - 15))} is starting in 15 minutes. Please be prepared for the session.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-20 - 15),
        receiver: "Joy Lau Xuan",
        referenceId: "S1006"
    },
    {
        uid: "N1061",
        title: "Support Session Reminder",
        message: `Your support session \"Getting Used to University Life\" with support seeker Puteri A\'isyah at ${printTime(minutesFromNow(-20))} has started. Please be join the session now.`,
        category: "Support Session",
        isRead: true,
        createdAt: minutesFromNow(-20),
        receiver: "Joy Lau Xuan",
        referenceId: "S1006"
    },

    {
        uid: "N1062",
        title: "New Support Request",
        message: "You have received a new support request \"Troubleshooting Development Tools\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-11T11:30:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1009"
    },
    {
        uid: "N1063",
        title: "Support Request Accepted",
        message: "Your support request \"Troubleshooting Development Tools\" has been accepted by Joy Lau Xuan. You can now schedule a session with the volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-11T11:40:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "R1009"
    },
    {
        uid: "N1064",
        title: "Support Session Scheduled",
        message: "Your accepted support request  \"Troubleshooting Development Tools\" has been scheduled on 2026-11-16 at 11:00 AM by Joy Lau Xuan.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-11T11:45:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1007"
    },
    {
        uid: "N1065",
        title: "Support Session Cancelled",
        message: "Your support session \"Troubleshooting Development Tools\" on 2026-11-16 at 11:00 AM has been cancelled by Joy Lau Xuan.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-12T03:30:00+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "S1007"
    },

    {
        uid: "N1066",
        title: "New Support Request",
        message: "You have received a new support request \"Github Installation\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-11T11:57:02+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "R1010"
    },
    {
        uid: "N1067",
        title: "Support Request Accepted",
        message: "Your support request \"Github Installation\" has been rejected by Adrinn Awi Goo. Please look for another volunteer.",  
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-12T08:16:10+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "R1010"
    },

    {
        uid: "N1068",
        title: "New Support Request",
        message: "You have received a new support request \"Python Programming Tutorial\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-12T01:26:22+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1011"
    },

    {
        uid: "N1069",
        title: "New Support Request",
        message: "You have received a new support request \"Delta Force Installation\" from Kim Ga-In. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-12T02:59:38+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "R1012"
    },
    {
        uid: "N1070",
        title: "Support Request Cancelled",
        message: "Support request \"Delta Force Installation\" sent by Kim Ga-In has been cancelled. \nReason: \"I changed my mind and no longer need assistance with this request.\"",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-12T10:25:33+08:00"),
        receiver: "Kim Ga-In",
        referenceId: "R1012"
    },

    {
        uid: "N1071",
        title: "New Support Request",
        message: "You have received a new support request \"Mobile Apps Tutorial Continuation\" from Joy Lau Xuan. Please review and respond to the request.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-18T15:00:00+08:00"),
        receiver: "Adrinn Awi Goo",
        referenceId: "R1013"
    },
    {
        uid: "N1072",
        title: "Support Request Accepted",
        message: "Your support request \"Mobile Apps Tutorial Continuation\" has been accepted by Adrinn Awi Goo. You can now schedule a session with the volunteer.",
        category: "Support Request",
        isRead: true,
        createdAt: ts("2026-11-18T16:00:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "R1013"
    },
    {
        uid: "N1073",
        title: "Support Session Scheduled",
        message: "Your accepted support request \"Mobile Apps Tutorial Continuation\" has been scheduled on 2026-11-30 at 2:00 PM by Adrinn Awi Goo.",
        category: "Support Session",
        isRead: true,
        createdAt: ts("2026-11-18T16:30:00+08:00"),
        receiver: "Joy Lau Xuan",
        referenceId: "S1009"
    }
]

const COLLECTIONS = ["users", "volunteers", "supportRequests", "supportSessions", "feedbacks", "notifications"];

async function clearData() {
    const batch = db.batch();

    for (const C of COLLECTIONS) {
        await db.recursiveDelete(db.collection(C))
    }

    for (const u of users) {
        try {
            await auth.deleteUser((await auth.getUserByEmail(u.email)).uid);
        } catch {
            // Account does not exist, delete nothing
        }
    }

    // // Delete data in firestore
    // for (const r of requests) batch.delete(db.doc(`supportRequests/${r.uid}`));
    // for (const s of sessions) batch.delete(db.doc(`supportSessions/${s.uid}`));
    // for (const f of feedbacks) batch.delete(db.doc(`feedbacks/${f.uid}`));

    // // Delete users in firebase auth and users + volunteers in firestore
    // for (const u of users) {
    //     try {
    //         const { uid } = await auth.getUserByEmail(u.email);
    //         batch.delete(db.doc(`users/${uid}`));
    //         batch.delete(db.doc(`volunteers/${uid}`));
    //         await auth.deleteUser((await auth.getUserByEmail(u.email)).uid);
    //     } catch {
    //         // Account does not exist, delete nothing
    //     }
    // }

    // await batch.commit();
}

async function getOrCreateAuthUser(email) {
    try {
        return await auth.getUserByEmail(email);
    } catch {
        return await auth.createUser({email, password: "Testing123!"});
    }
}

async function seed() {
    try {
        await clearData();
        const uids = {};

        await db.doc("counters/ids").set({
            request: 1000,
            session: 1000,
            feedback: 1000,
            notification: 1000
        })

        const counter = (await db.doc("counters/ids").get()).data();

        for (const u of users) {
            const authUser = await getOrCreateAuthUser(u.email);
            uids[u.fullName] = authUser.uid;

            await db.doc(`users/${authUser.uid}`).set({
                uid: authUser.uid,
                email: u.email,
                fullName: u.fullName,
                studentId: u.studentId,
                isVolunteer: u.isVolunteer,
                faculty: u.faculty,
                program: u.program,
                bio: u.bio
            })

            if (u.isVolunteer) {
                const v = volunteers.find(v => v.fullName === u.fullName);

                await db.doc(`volunteers/${authUser.uid}`).set({
                    uid: authUser.uid,
                    preferredMode: v.preferredMode,
                    rating: v.rating,
                    isActive: v.isActive,
                    supportCategories: v.supportCategories,
                    skills: v.skills,
                    availability: v.availability
                })
            }
        }

        for (const r of requests) {
            ++counter.request;
            await db.doc(`supportRequests/${r.uid}`).set({
                uid: r.uid,
                category: r.category,
                title: r.title,
                description: r.description,
                supportMode: r.supportMode,
                proposedTimeSlots: r.proposedTimeSlots,
                status: r.status,
                createdAt: r.createdAt,
                ...(r.respondedAt !== undefined && {respondedAt: r.respondedAt}),
                ...(r.scheduledAt !== undefined  && {scheduledAt: r.scheduledAt}),
                ...(r.cancelledAt !== undefined && {cancelledAt: r.cancelledAt}),
                ...(r.cancelledReason !== undefined && {cancelledReason: r.cancelledReason}),
                seekerId: uids[r.seekerName],
                volunteerId: uids[r.volunteerName]
            })
        }

        for (const s of sessions) {
            ++counter.session;
            await db.doc(`supportSessions/${s.uid}`).set({
                uid: s.uid,
                category: s.category,
                title: s.title,
                description: s.description,
                supportMode: s.supportMode,
                dateTime: s.dateTime,
                duration: s.duration,
                status: s.status,
                ...(s.completedAt !== undefined && {completedAt: s.completedAt}),
                ...(s.cancelledAt !== undefined && {cancelledAt: s.cancelledAt}),
                ...(s.cancelledBy !== undefined && {cancelledBy: uids[s.cancelledBy]}),
                ...(s.cancelledReason !== undefined && {cancelledReason: s.cancelledReason}),
                requestId: s.requestId,
                seekerId: uids[s.seekerName],
                volunteerId: uids[s.volunteerName]
            })
        }

        for (const f of feedbacks) {
            ++counter.feedback;
            await db.doc(`feedbacks/${f.uid}`).set({
                uid: f.uid,
                rating: f.rating,
                comments: f.comments,
                createdAt: f.createdAt,
                sessionId: f.sessionId
            })
        }

        for (const n of notifications) {
            ++counter.notification;
            await db.doc(`notifications/${n.uid}`).set({
                uid: n.uid,
                title: n.title,
                message: n.message,
                category: n.category,
                isRead: n.isRead,
                createdAt: n.createdAt,
                userId: uids[n.receiver],
                referenceId: n.referenceId
            })
        }

        await db.doc("counters/ids").update({
            request: counter.request,
            session: counter.session,
            feedback: counter.feedback,
            notification: counter.notification
        })

        console.log("Seed complete");

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

seed();