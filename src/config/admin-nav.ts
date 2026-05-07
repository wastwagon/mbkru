import { accountabilityProse } from "@/config/accountability-catalogue-destinations";

export type AdminNavItem = { href: string; label: string; description?: string };

export type AdminNavGroup = { title: string; items: AdminNavItem[] };
export type AdminDashboardTool = AdminNavItem & { groupTitle: string };

/**
 * Single navigation source for the admin shell (sidebar + mobile menu).
 * Keep labels aligned with `/admin` dashboard cards where possible.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/posts", label: "News posts", description: "Create, edit, and publish news articles." },
      { href: "/admin/media", label: "Image library", description: "Upload once and reuse images in content." },
      { href: "/admin/resources", label: "Resource library", description: "Manage public documents and downloads." },
      { href: "/admin/manifestos", label: "Manifesto registry", description: "Source and manage manifesto records." },
    ],
  },
  {
    title: "Voice & inbound",
    items: [
      {
        href: "/admin/reports",
        label: "Citizen reports",
        description: "Triage Voice, situational, and election reports.",
      },
      {
        href: "/admin/analytics/citizen-reports",
        label: "Citizen report analytics",
        description: "Review aggregate report trends and SLA signals.",
      },
      {
        href: "/admin/analytics/mbkru-voice",
        label: "MBKRU Voice analytics",
        description: "Track chatbot and accessibility event performance.",
      },
      { href: "/admin/petitions", label: "Petitions", description: "Moderate petition status and visibility." },
      {
        href: "/admin/analytics/petition-pending",
        label: "Petition pending analytics",
        description: "Monitor pending email-verification signature rows.",
      },
      {
        href: "/admin/public-causes",
        label: "Public causes",
        description: "Manage public-thread lifecycle for Citizen Voice causes.",
      },
      {
        href: "/admin/contact-submissions",
        label: "Contact form",
        description: "Review inbound contact messages from the public site.",
      },
      { href: "/admin/leads", label: "Lead capture", description: "Export and filter signup waitlists." },
      {
        href: "/admin/diaspora-feedback",
        label: "Diaspora feedback",
        description: "Review diaspora experience and programme feedback.",
      },
    ],
  },
  {
    title: "Accountability",
    items: [
      {
        href: "/admin/parliament",
        label: accountabilityProse.adminParliamentSectionTitle,
        description: "Maintain parliament roster and promise catalogue rows.",
      },
      { href: "/admin/report-card", label: "Report card", description: "Create and publish scorecard cycles." },
      {
        href: "/admin/town-halls",
        label: "Town halls & forums",
        description: "Manage programme events and roadmap placeholders.",
      },
    ],
  },
  {
    title: "Communities",
    items: [
      { href: "/admin/communities", label: "Communities", description: "Create communities and manage membership." },
      {
        href: "/admin/communities/moderation",
        label: "Post moderation",
        description: "Review pending community posts in one queue.",
      },
      {
        href: "/admin/community-reports",
        label: "Community reports",
        description: "Process cross-community post report triage.",
      },
      {
        href: "/admin/community-verifications",
        label: "Verifications",
        description: "Review identity and traditional-role verification requests.",
      },
      { href: "/admin/members", label: "Members", description: "Manage member identity review statuses." },
    ],
  },
  {
    title: "System",
    items: [
      {
        href: "/admin/notifications",
        label: "Notification outbox",
        description: "Run and retry email/SMS delivery jobs.",
      },
      {
        href: "/admin/operational-audit",
        label: "Operational audit",
        description: "Inspect sensitive admin action logs.",
      },
      { href: "/admin/settings", label: "Settings", description: "Run operational maintenance tasks." },
    ],
  },
];

export function adminNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Dashboard cards are every non-overview nav item, grouped by section title. */
export function getAdminDashboardTools(): AdminDashboardTool[] {
  return ADMIN_NAV_GROUPS.filter((group) => group.title !== "Overview").flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupTitle: group.title,
    })),
  );
}
