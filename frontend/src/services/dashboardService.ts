import { getUser } from "./userService";
import { getSupportRequestsByStudent } from "./supportRequestService";
import { getSupportSessionsByStudent } from "./supportSessionService";
import { formatClockTime } from "../utils/dateTime";
import type { SupportRequest } from "../types/supportRequest";
import type { SupportSession } from "../types/supportSession";

export type DashboardRole = "student" | "volunteer";
export type DashboardStatus = "active" | "pending" | "accepted" | "completed" | "cancelled" | "rejected" | "scheduled";

export interface DashboardSession {
  title: string;
  mode: string;
  date: string;
  start: string;
  end: string;
  status: DashboardStatus;
}

export interface DashboardRequest {
  title: string;
  to: string;
  mode: string;
  status: DashboardStatus;
}

export interface DashboardData {
  userName: string;
  avatarUrl: string;
  isVolunteer: boolean;
  role: DashboardRole;
  stats: { requests: number; upcoming: number; attended: number };
  sessions: DashboardSession[];
  requests: DashboardRequest[];
}

const getOtherPartyId = (request: SupportRequest, role: DashboardRole): string =>
  role === "volunteer" ? request.seekerId : request.volunteerId;

const formatSessionDate = (date: Date): string =>
  `${date.toLocaleDateString("en-GB", { weekday: "short" })}, ${date.toLocaleDateString("en-GB")}`;

export const getDashboardData = async (
  uid: string,
  role: DashboardRole,
  fallbackName: string,
  fallbackPhoto: string | null
): Promise<DashboardData> => {
  const user = await getUser(uid);
  const activeRole = role === "volunteer" && user?.isVolunteer ? "volunteer" : "student";
  const [supportRequests, supportSessions] = await Promise.all([
    getSupportRequestsByStudent(uid, activeRole === "volunteer"),
    getSupportSessionsByStudent(uid, activeRole === "volunteer"),
  ]);

  const otherPartyIds = [...new Set(
    supportRequests.map((request) => getOtherPartyId(request, activeRole)).filter(Boolean)
  )];
  const otherPartyEntries = await Promise.all(
    otherPartyIds.map(async (otherPartyId) => [otherPartyId, await getUser(otherPartyId)] as const)
  );
  const otherPartyNames = new Map(
    otherPartyEntries.map(([otherPartyId, otherParty]) => [otherPartyId, otherParty?.fullName])
  );

  const now = Date.now();
  const upcomingSessions = supportSessions
    .filter((session) => session.status === "Active" && session.dateTime.toDate().getTime() >= now)
    .sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
  const completedSessions = supportSessions.filter((session) => session.status === "Completed");
  const recentRequests = [...supportRequests]
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 3);

  return {
    userName: user?.fullName || fallbackName,
    avatarUrl: user?.profilePic || fallbackPhoto || "",
    isVolunteer: user?.isVolunteer ?? false,
    role: activeRole,
    stats: {
      requests: activeRole === "student"
        ? supportRequests.length
        : supportRequests.filter((request) => request.status === "Accepted" || request.status === "Scheduled").length,
      upcoming: upcomingSessions.length,
      attended: completedSessions.length,
    },
    sessions: upcomingSessions.slice(0, 3).map((session: SupportSession) => {
      const date = session.dateTime.toDate();
      return {
        title: session.title,
        mode: session.supportMode,
        date: formatSessionDate(date),
        start: formatClockTime(date),
        end: formatClockTime(new Date(date.getTime() + session.duration * 60_000)),
        status: session.status.toLowerCase() as DashboardStatus,
      };
    }),
    requests: recentRequests.map((request: SupportRequest) => {
      const otherPartyId = getOtherPartyId(request, activeRole);
      return {
        title: request.title,
        to: otherPartyId ? otherPartyNames.get(otherPartyId) || (activeRole === "volunteer" ? "Support seeker" : "Volunteer") : "Not assigned",
        mode: request.supportMode,
        status: request.status.toLowerCase() as DashboardStatus,
      };
    }),
  };
};
