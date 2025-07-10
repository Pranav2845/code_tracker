// src/utils/contestEventUtils.js
import { getContestLogoUrl } from "./contestLogo.js";
import { format as tzFormat, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export const IST_TIMEZONE = "Asia/Kolkata";

// Parse any time string (UTC or local) and return a UTC Date object
export function parseContestTimeToUTC(dateStr) {
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === "string") {
    // If timezone info like 'Z' or an offset is present, parse normally
    if (/Z|[+-]\d{2}:?\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }
     // CLIST times are UTC without timezone info
    return new Date(`${dateStr}Z`);
  }
  return new Date(dateStr);
}

// Format a Date object in UTC as "13th July, 2025"
export function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return tzFormat(date, "do MMMM, yyyy", { timeZone: "UTC" });
}

// Format Date object as "13th July, 2025" in IST
export function formatDateIST(date) {
  date = parseContestTimeToUTC(date);
  const zoned = utcToZonedTime(date, IST_TIMEZONE);
  return tzFormat(zoned, "do MMMM, yyyy", { timeZone: IST_TIMEZONE });
}

// Format as "08:00 PM - 09:30 PM" in IST
export function formatTimeRangeIST(start, end) {
  start = parseContestTimeToUTC(start);
  end = parseContestTimeToUTC(end);
  const startZoned = utcToZonedTime(start, IST_TIMEZONE);
  const endZoned = utcToZonedTime(end, IST_TIMEZONE);
  return (
    tzFormat(startZoned, "hh:mm a", { timeZone: IST_TIMEZONE }) +
    " - " +
    tzFormat(endZoned, "hh:mm a", { timeZone: IST_TIMEZONE })
  );
}

export function getContestStatus(contest) {
  if (!contest) return "";
  const endUtc = parseContestTimeToUTC(contest.endTime);
  return endUtc.getTime() > Date.now() ? "Upcoming" : "Contest Ended";
}

export function createAddToCalendarUrl(contest) {
  if (!contest) return "";
  const start = parseContestTimeToUTC(contest.startTime)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, "");
  const end = parseContestTimeToUTC(contest.endTime)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    contest.name,
 )}&dates=${start}/${end}&details=${encodeURIComponent(contest.url)}&ctz=${IST_TIMEZONE}&sf=true&output=xml`;}

export function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

// Returns a Date in IST for display in calendar
function getDisplayDate(dateStr) {
  const utc = parseContestTimeToUTC(dateStr);
  // This gives a Date object corresponding to IST, but the JS Date is still in system local time,
  // which is what most calendar components expect!
  return utcToZonedTime(utc, IST_TIMEZONE);
}

export function contestToCalendarEvent(contest) {
  if (!contest) return null;
  // UTC times for accurate popups, IST for calendar display
  const startUtc = parseContestTimeToUTC(contest.startTime);
  const endUtc = parseContestTimeToUTC(contest.endTime);

  // These are Date objects in IST (for calendar cells)
  const start = getDisplayDate(contest.startTime);
  const endOriginal = getDisplayDate(contest.endTime);

  let eventEnd = endOriginal;
  // If contest spans days, only show first day in calendar (for correct cell coloring)
  if (start.toDateString() !== endOriginal.toDateString()) {
    eventEnd = new Date(start);
    eventEnd.setDate(eventEnd.getDate() + 1);
    eventEnd.setHours(0, 0, 0, 0);
  }

  return {
    id: contest.id,
    title: contest.name,
    start,
    end: eventEnd,
    allDay: false,
    url: contest.url,
    platform: contest.platform?.toLowerCase(),
    originalData: contest,
    popupDetail: {
      title: contest.name,
      date: formatDateIST(startUtc), // Always IST
      time: formatTimeRangeIST(startUtc, endUtc), // Always IST
      duration: formatDuration(endUtc.getTime() - startUtc.getTime()),
      status: getContestStatus(contest),
      platform: contest.platform,
      platformLogo: getContestLogoUrl(contest),
      url: contest.url,
      addToCalendarUrl: createAddToCalendarUrl(contest),
    },
  };
}

export function contestsToCalendarEvents(contests = []) {
  return contests.map(contestToCalendarEvent).filter(Boolean);
}
