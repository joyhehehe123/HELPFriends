import "./Dashboard.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../../components/AppNavbar";
import { onAuthStateChange } from "../../services/authService";
import { getDashboardData, type DashboardData, type DashboardRole, type DashboardStatus } from "../../services/dashboardService";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const ICONS = {
  arrow:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  document:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
};

function icon(name: keyof typeof ICONS, className: string): HTMLSpanElement {
  const span = el("span", className);
  span.innerHTML = ICONS[name];
  span.setAttribute("aria-hidden", "true");
  return span;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function createStatCard(label: string, value: number, href: string): HTMLElement {
  const card = el("article", "dash-stat");
  card.append(el("h3", "dash-stat__label heading", label), el("p", "dash-stat__value heading", String(value)));

  const link = el("a", "link dash-viewall dash-stat__link", "View all ");
  link.href = href;
  link.appendChild(icon("arrow", "dash-viewall__icon"));
  card.appendChild(link);
  return card;
}

function createStatusPill(status: DashboardStatus): HTMLElement {
  return el("span", `dash-status dash-status--${status}`, capitalise(status));
}

function createSessionItem(s: DashboardData["sessions"][number]): HTMLElement {
  const item = el("li", "dash-item");

  const body = el("div", "dash-item__body");
  body.append(
    el("p", "dash-item__title", s.title),
    el("p", "dash-item__meta", `Mode: ${s.mode}`)
  );

  const time = el("p", "dash-item__meta dash-item__time");
  time.appendChild(icon("clock", "dash-item__time-icon"));
  time.appendChild(el("span", undefined, `${s.date} ${s.start} - ${s.end}`));
  body.appendChild(time);

  item.append(body, createStatusPill(s.status));
  return item;
}

function createRequestItem(r: DashboardData["requests"][number]): HTMLElement {
  const item = el("li", "dash-item");

  const body = el("div", "dash-item__body");
  body.append(
    el("p", "dash-item__title", r.title),
    el("p", "dash-item__meta", `To: ${r.to}`),
    el("p", "dash-item__meta", `Mode: ${r.mode}`)
  );

  item.append(body, createStatusPill(r.status));
  return item;
}

function createPanel(
  iconName: "calendar" | "document",
  title: string,
  href: string,
  items: HTMLElement[]
): HTMLElement {
  const panel = el("section", "dash-panel");

  const header = el("div", "dash-panel__header");
  const heading = el("h2", "dash-panel__title heading");
  heading.append(icon(iconName, "dash-panel__icon"), el("span", undefined, title));

  const link = el("a", "link dash-viewall", "View all ");
  link.href = href;
  link.appendChild(icon("arrow", "dash-viewall__icon"));
  header.append(heading, link);

  const list = el("ul", "dash-panel__list");
  items.forEach((i) => list.appendChild(i));

  panel.append(header, list);
  return panel;
}

function createRoleToggle(active: DashboardRole, onChange: (role: DashboardRole) => void): HTMLElement {
  const wrap = el("div", "dash-toggle");
  wrap.setAttribute("role", "group");
  wrap.setAttribute("aria-label", "Dashboard view");

  (["student", "volunteer"] as DashboardRole[]).forEach((role) => {
    const btn = el(
      "button",
      `dash-toggle__btn${role === active ? " dash-toggle__btn--active" : ""}`,
      capitalise(role)
    );
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(role === active));
    btn.addEventListener("click", () => {
      if (role !== active) onChange(role);
    });
    wrap.appendChild(btn);
  });
  return wrap;
}

function createDashboard(
  data: DashboardData,
  initialRole: DashboardRole,
  onRoleChange: (role: DashboardRole) => void,
  canVolunteer: boolean
): HTMLElement {
  const page = el("div", "dash-page");
  const main = el("main", "dash-main");
  page.appendChild(main);

  function render(role: DashboardRole) {
    main.replaceChildren();

    // Welcome row
    const welcome = el("div", "dash-welcome");
    const text = el("div", "dash-welcome__text");
    text.append(
      el("h1", "dash-welcome__title heading", `Welcome back, ${data.userName}!`),
      el("p", "dash-welcome__subtitle heading", "Here\u2019s an overview of your HELPFriends journey.")
    );
    if (canVolunteer) welcome.append(text, createRoleToggle(role, onRoleChange));
    else welcome.appendChild(text);

    // Stat cards
    const stats = el("div", "dash-stats");
    const requestLabel = role === "student" ? "Support Request" : "Accepted Support Request";
    stats.append(
      createStatCard(requestLabel, data.stats.requests, "/support-requests"),
      createStatCard("Upcoming Sessions", data.stats.upcoming, "/support-sessions"),
      createStatCard("Sessions Attended", data.stats.attended, "/support-sessions?filter=completed")
    );

    // Panels
    const panels = el("div", "dash-panels");
    panels.append(
      createPanel("calendar", "Upcoming Sessions", "/support-sessions", data.sessions.map(createSessionItem)),
      createPanel("document", "Recent Support Requests", "/support-requests", data.requests.map(createRequestItem))
    );

    main.append(welcome, stats, panels);
  }

  render(initialRole);
  return page;
}

const DASHBOARD_LINKS = [
  { label: "Request a Support", href: "/support-request-form" },
  { label: "Support Requests", href: "/support-requests" },
  { label: "Support Sessions", href: "/support-sessions" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<DashboardRole>("student");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);
      void getDashboardData(
        user.uid,
        role,
        user.displayName || user.email?.split("@")[0] || "User",
        user.photoURL
      ).then((dashboardData) => {
        if (isCurrent) {
          setRole(dashboardData.role);
          setData(dashboardData);
        }
      }).catch((loadError: unknown) => {
        if (isCurrent) {
          console.error("Error loading dashboard: ", loadError);
          setError("Unable to load your dashboard. Please try again.");
        }
      }).finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    });

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [navigate, role]);

  useEffect(() => {
    if (!data || !contentRef.current) return;
    const dashboard = createDashboard(data, role, (nextRole) => {
      setData(null);
      setRole(nextRole);
    }, data.isVolunteer);
    contentRef.current?.replaceChildren(dashboard);
    return () => dashboard.remove();
  }, [data, role]);

  return (
    <div className="dash-layout">
      <AppNavbar
        links={DASHBOARD_LINKS}
        notificationsHref="/notifications"
        activeHref="/dashboard"
        userName={data?.userName || "Account"}
        userPhoto={data?.avatarUrl || undefined}
        onNavigate={navigate}
      />
      <div className="dash-content" ref={contentRef} aria-live="polite">
        {isLoading && <p className="dash-message">Loading your dashboard…</p>}
        {!isLoading && error && <p className="dash-message dash-message--error" role="alert">{error}</p>}
      </div>
    </div>
  );
}