export const ROUTES = {
  HOME: "/dashboard",
  LOGIN: "/login",
  EVENTS: {
    CREATE: "/events/create",
    INVITE: "/events/invite",
    DETAIL: (id: string | number) => `/events/${id}`,
    GROUP: (id: string | number) => `/events/${id}/group`,
    RULES: (id: string | number) => `/events/${id}/rules`,
    PAYMENTS: (id: string | number) => `/events/${id}/payments`,
    SETTLED: (id: string | number) => `/events/${id}/settled`,
    ARCHIVED: (id: string | number) => `/events/${id}/archived`,
  },
} as const;

const EXCLUDED_EVENT_PATHS: string[] = [ROUTES.EVENTS.CREATE, ROUTES.EVENTS.INVITE];

export function isEventDetailPage(pathname: string | null): boolean {
  if (!pathname) return false;
  if (!pathname.startsWith("/events/")) return false;
  return !EXCLUDED_EVENT_PATHS.includes(pathname);
}
