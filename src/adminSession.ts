// Admin "away" timeout: the admin is signed out once they have been away from the
// admin page (another page, another tab, minimised or closed browser) for longer
// than ADMIN_AWAY_LIMIT_MS. While the admin page is open and visible, a heartbeat
// keeps the "last seen" time fresh.

export const ADMIN_AWAY_LIMIT_MS = 60 * 1000;
export const ADMIN_HEARTBEAT_MS = 10 * 1000;

const LAST_SEEN_KEY = 'aap-admin-last-seen';

export const markAdminSeen = () => {
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  } catch {
    // Storage blocked (private mode): the admin simply isn't remembered between visits
  }
};

export const clearAdminSeen = () => {
  try {
    localStorage.removeItem(LAST_SEEN_KEY);
  } catch {
    // ignore
  }
};

/** True when there is no record of the admin page being open within the limit. */
export const adminAwayTooLong = () => {
  try {
    const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY));
    return !lastSeen || Date.now() - lastSeen > ADMIN_AWAY_LIMIT_MS;
  } catch {
    return true;
  }
};
