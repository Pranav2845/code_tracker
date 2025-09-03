// src/api/contests.js
import api from "./axios";

/*
 * * Fetch contests from the backend. The backend may either return
 * just an array of upcoming contests (`/contests`) or an object with
 * `upcoming` and `past` arrays (`/contests/all`).
 *
 * This helper normalises the response to always return an object
 * with `upcoming` and `past` arrays so consumers don't need to worry
 * about the specific API shape.
 */
export async function fetchContests() {
    const { data } = await api.get('/contests/all');

  // Old API: '/contests' returned only an array of upcoming contests
  if (Array.isArray(data)) {
    return { upcoming: data, past: [] };
  }

  const upcoming = Array.isArray(data?.upcoming) ? data.upcoming : [];
  const past = Array.isArray(data?.past) ? data.past : [];
  return { upcoming, past };
}