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

const users = [
    {
        email: "B2300486@helplive.edu.my",
        fullName: "Joy Lau Xuan",
        studentId: "B2300486",
        isVolunteer: true,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Computer Science (Honours)",
        bio: "I love hamster",
        profilePic: "/profilePics/pfpcat.jpg"
    },
    {
        email: "B2400423@helplive.edu.my",
        fullName: "Kim Ga-In",
        studentId: "B2400423",
        isVolunteer: false,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Information Technology (Honours)",
        bio: null,
        profilePic: null
    },
    {
        email: "B2300490@helplive.edu.my",
        fullName: "Adrinn Awi Goo",
        studentId: "B2300490",
        isVolunteer: true,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Information Technology (Honours)",
        bio: "I love donuts",
        profilePic: "/profilePics/nikki.jpg"
    },
    {
        email: "B2401344@helplive.edu.my",
        fullName: "Puteri A\'isyah",
        studentId: "B2401344",
        isVolunteer: false,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Computer Science (Honours)",
        bio: "I love sushi",
        profilePic: "/profilePics/chiikabu.png"
    },
    {
        email: "B2401411@helplive.edu.my",
        fullName: "Sophea Natasha",
        studentId: "B2401411",
        isVolunteer: true,
        faculty: "Faculty of Computing and Digital Technology",
        program: "Bachelor of Information Technology in Data Analytics (Honours)",
        bio: "I love winston",
        profilePic: "/profilePics/Bob.jpg"
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
                    {
                        start: "09:00", end: "18:00"
                    }
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
                    {
                        start: "14:00", end: "17:00"
                    }
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
            ts("2026-10-02T14:00:00+08:00"),
            ts("2026-10-02T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-01T09:00:00+08:00"),
        respondedAt: ts("2026-10-01T10:30:00+08:00"),
        scheduledAt: ts("2026-10-02T14:00:00+08:00"),
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
            ts("2026-10-09T10:00:00+08:00"),
            ts("2026-10-09T11:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-05T09:00:00+08:00"),
        respondedAt: ts("2026-10-05T09:30:00+08:00"),
        scheduledAt: ts("2026-10-05T10:00:00+08:00"),
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
            ts("2026-10-09T13:00:00+08:00"),
            ts("2026-10-09T14:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-06T11:00:00+08:00"),
        respondedAt: ts("2026-10-06T11:30:00+08:00"),
        scheduledAt: ts("2026-10-06T12:00:00+08:00"),
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
            minutesFromNow(-100), // ts("2026-10-23T10:00:00+08:00"),
            minutesFromNow(-70)  // ts("2026-10-23T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-09T12:35:02+08:00"),
        respondedAt: ts("2026-10-09T13:11:11+08:00"),
        scheduledAt: ts("2026-10-09T13:30:00+08:00"),
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
            minutesFromNow(40), // ts("2026-10-16T14:00:00+08:00"),
            minutesFromNow(70) // ts("2026-10-16T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-10T10:00:00+08:00"),
        respondedAt: ts("2026-10-10T10:30:00+08:00"),
        scheduledAt: ts("2026-10-10T11:00:00+08:00"),
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
            ts("2026-10-22T10:00:00+08:00"),
            ts("2026-10-22T17:00:00+08:00"),
            ts("2026-10-23T13:30:00+08:00")
        ],
        status: "Accepted",
        createdAt: ts("2026-10-10T10:27:57+08:00"),
        respondedAt: ts("2026-10-10T13:20:51+08:00"),
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
            minutesFromNow(300), // ts("2026-10-19T12:00:00+08:00"),
            minutesFromNow(330)  // ts("2026-10-19T13:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-11T09:00:00+08:00"),
        respondedAt: ts("2026-10-11T09:30:00+08:00"),
        scheduledAt: ts("2026-10-11T10:00:00+08:00"),
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
            minutesFromNow(-50), // ts("2026-10-19T14:00:00+08:00"),
            minutesFromNow(-20)  // ts("2026-10-19T15:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-11T10:00:00+08:00"),
        respondedAt: ts("2026-10-11T10:30:00+08:00"),
        scheduledAt: ts("2026-10-11T11:00:00+08:00"),
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
            ts("2026-10-16T11:00:00+08:00"),
            ts("2026-10-16T12:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-11T11:30:00+08:00"),
        respondedAt: ts("2026-10-11T11:30:00+08:00"),
        scheduledAt: ts("2026-10-11T11:45:00+08:00"),
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
            ts("2026-10-16T14:00:00+08:00"),
            ts("2026-10-16T15:00:00+08:00")
        ],
        status: "Rejected",
        createdAt: ts("2026-10-11T11:57:02+08:00"),
        respondedAt: ts("2026-10-12T08:16:10+08:00"),
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
            ts("2026-10-26T10:00:00+08:00"),
            ts("2026-10-26T15:00:00+08:00")
        ],
        status: "Pending",
        createdAt: ts("2026-10-12T01:26:22+08:00"),
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
            ts("2026-10-16T14:00:00+08:00"),
            ts("2026-10-16T15:00:00+08:00")
        ],
        status: "Cancelled",
        createdAt: ts("2026-10-12T02:59:38+08:00"),
        cancelledAt: ts("2026-10-12T10:25:33+08:00"),
        cancelledReason: "Well... ik she would reject this stupid request so i reject myself first heheheheh",
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
            ts("2026-10-30T14:00:00+08:00"),
            ts("2026-10-30T15:00:00+08:00"),
            ts("2026-10-30T16:00:00+08:00")
        ],
        status: "Scheduled",
        createdAt: ts("2026-10-18T15:00:00+08:00"),
        respondedAt: ts("2026-10-18T16:00:00+08:00"),
        scheduledAt: ts("2026-10-30T15:00:00+08:00"),
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
        dateTime: ts("2026-10-02T14:00:00+08:00"),
        duration: 60,
        status: "Completed",
        completedAt: ts("2026-10-02T15:30:00+08:00"),
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
        dateTime: ts("2026-10-09T10:00:00+08:00"),
        duration: 60,
        status: "Completed",
        completedAt: ts("2026-10-09T11:00:00+08:00"),
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
        dateTime: ts("2026-10-09T13:00:00+08:00"),
        duration: 60,
        status: "Completed",
        completedAt: ts("2026-10-09T14:00:00+08:00"),
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
        dateTime: minutesFromNow(40), // ts("2026-10-16T14:00:00+08:00"),
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
        dateTime: minutesFromNow(300), // ts("2026-10-19T12:00:00+08:00"),
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
        dateTime: minutesFromNow(-20), // ts("2026-10-19T14:00:00+08:00"),
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
        dateTime: ts("2026-10-16T11:00:00+08:00"),
        duration: 60,
        status: "Cancelled",
        cancelledAt: ts("2026-10-12T03:30:00+08:00"),
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
        dateTime: minutesFromNow(-100), // ts("2026-10-23T15:00:00+08:00"),
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
        dateTime: ts("2026-10-30T15:00:00+08:00"),
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
        comments: "The session was supoer helpfulll",
        sessionId: "S1002"
    }
];

const COLLECTIONS = ["users", "volunteers", "supportRequests", "supportSessions", "feedbacks"];

async function clearData() {
    const batch = db.batch();

    // Delete data in firestore
    for (const r of requests) batch.delete(db.doc(`supportRequests/${r.uid}`));
    for (const s of sessions) batch.delete(db.doc(`supportSessions/${s.uid}`));
    for (const f of feedbacks) batch.delete(db.doc(`feedbacks/${f.uid}`));

    // Delete users in firebase auth and users + volunteers in firestore
    for (const u of users) {
        try {
            const { uid } = await auth.getUserByEmail(u.email);
            batch.delete(db.doc(`users/${uid}`));
            batch.delete(db.doc(`volunteers/${uid}`));
            await auth.deleteUser((await auth.getUserByEmail(u.email)).uid);
        } catch {
            // Account does not exist, delete nothing
        }
    }

    await batch.commit();
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
                bio: u.bio,
                profilePic: u.profilePic
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
                sessionId: f.sessionId
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