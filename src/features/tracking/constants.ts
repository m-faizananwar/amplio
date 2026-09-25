export const CLICK_COOKIE = "nn_click";
export const CLICK_COOKIE_DAYS = 30;
export const CLICK_QUERY_PARAM = "nn";
export const RESULTS_WINDOW_DAYS = 30;
export const SERIES_DAYS = { week: 7, month: 30, year: 365 } as const;
export type SeriesRange = keyof typeof SERIES_DAYS;
export const PIXEL_EVENT_TYPES = ["visit", "signup", "purchase"] as const;
// Salt for hashed visitor IPs; changing it re-keys every stored hash, so it stays as first deployed.
export const IP_HASH_SALT = "naano-rebuild";
export const CSV_MAX_ROWS = 10_000;
// The trail drawer lists at most this many rows; the CSV export has the rest.
export const TRAIL_ROW_LIMIT = 300;
export const TRAIL_WINDOW_DAYS = RESULTS_WINDOW_DAYS;
