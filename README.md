# HELPFriends

HELPFriends is a web-based peer-to-peer support platform for HELP University students. Students can request help in areas such as academic support, technology, new student guidance and general student matters, and student volunteers can accept requests and run support sessions.

Course: BIT216 Software Engineering Principles (HELP University)
Lecturer: Ms Seetha Letchumi Sukumaran

## Team

| Name | Student ID | Use case |
|---|---|---|
| Joy Lau Xuan (Team Leader) | B2300486 | Use Case 3: Manage Support Session & Provide Feedback |
| Fariz Haiqal bin Fairouz | B2401026 | Use Case 1: Manage Student & Volunteer Profile |
| Kim Ga-In | B2400423 | Use Case 2: Support Request & Volunteer Matching |

Contact (team leader): B2300486@helplive.edu.my

> Check the use case assignment above against your Assignment 1 WBS before submitting.

## Features

- **Profile management:** registration, login with OTP verification, password reset, student and volunteer profiles
- **Support requests and volunteer matching:** submit a request, filter volunteers by category and skill, track request status
- **Support sessions:** schedule a session within the volunteer's availability, cancel (not within 2 hours of the start), automatic completion once the session ends
- **Feedback:** rate a completed session and edit the feedback within 48 hours
- **Notifications:** in-app notifications with an unread indicator on the navbar bell

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, CSS (design tokens) |
| Icons | lucide-react |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Email (OTP) | EmailJS |
| Hosting | Firebase Hosting |
| Version control | Git and GitHub |

HELPFriends is a serverless app. The React app talks to Firebase directly, and Firestore security rules protect the data. There is no custom backend server.

## Repository structure

```
HELPFriends/
├── frontend/        React + Vite application (src/, public/, package.json)
├── backend/         Backend notes (Firebase provides the backend services)
├── database/        Firestore rules, indexes and the seed script
├── documentation/
│   ├── project-plan/
│   ├── requirements/
│   ├── design/
│   └── testing/
├── README.md
└── .gitignore
```

Inside `frontend/src/`:

```
components/   shared UI (navbar, button, toast, confirm dialog)
pages/        one folder per feature area
services/     Firestore and Auth access (one file per collection)
types/        TypeScript interfaces
styles/       global styles and design tokens
config/       service configuration (EmailJS)
```

## Getting started

### Prerequisites

- Node.js (LTS) and npm
- A Firebase project with Authentication (Email/Password) and Firestore enabled
- Git

### 1. Clone the repository

```bash
git clone https://github.com/joyhehehe123/HELPFriends.git
cd HELPFriends
```

### 2. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the address printed in the terminal (usually `http://localhost:5173/`).

### 3. Configure Firebase and EmailJS

Add your own values in the config files used by the app (`src/firebase.ts` and `src/config/emailjs.ts`), or in a local `.env` file read through `import.meta.env`. Do not commit secrets.

### 4. Seed the database (optional)

The seed script creates test users, volunteers, requests, sessions, feedback and counters.

```bash
cd database
npm install
node seed.mjs
```

It needs a Firebase service account key saved as `database/serviceAccountKey.json`. This file is private and must never be committed. The script deletes existing data in the seeded collections before inserting, so only run it against a test project.

Test accounts created by the seed use the password `Testing123!`.

### Useful commands (inside `frontend/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run lint` | Check code with ESLint |

## Deployment

The repository root holds `firebase.json` and `.firebaserc`.

```bash
cd frontend
npm run build
cd ..
firebase deploy
```

## Git workflow

- `main` holds stable, working code.
- Each feature or task is developed on its own branch (for example `feature/session-scheduling`).
- Changes are merged through pull requests, with merge conflicts resolved and documented.
- Commit messages describe what changed and why.

## Known limitations

- Notifications are created in the browser when an action happens. Time-based reminders and scheduled emails are not supported, because they need server-side scheduling.
- Sessions are marked as completed automatically when a user opens the app after the session end time.
- Two users booking the same volunteer at the same moment can still clash, because Firestore cannot lock a query.

## Documentation

All project documents are in `documentation/`: project plan, requirements specification, design, and testing.

## Academic note

This project was built for BIT216 Assignment 2. Any use of AI tools is acknowledged in the final report.