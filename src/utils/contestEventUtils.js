// src/utils/contestEventUtils.js
import { getContestLogoUrl } from "./contestLogo.js";
import tzFormat from "date-fns-tz/format";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";

export const IST_TIMEZONE = "Asia/Kolkata";

// Parse any time string as IST and return UTC Date object
export function parseContestTimeToUTC(dateStr) {
  return zonedTimeToUtc(dateStr, IST_TIMEZONE);
}

// Format a Date object in UTC as "13th July, 2025"
export function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return tzFormat(date, "do MMMM, yyyy", { timeZone: "UTC" });
}

// Format Date object as "13th July, 2025" in IST
export function formatDateIST(date) {
  if (!(date instanceof Date)) date = parseContestTimeToUTC(date);
  const zoned = utcToZonedTime(date, IST_TIMEZONE);
  return tzFormat(zoned, "do MMMM, yyyy", { timeZone: IST_TIMEZONE });
}

// Format as "08:00 PM - 09:30 PM" in IST
export function formatTimeRangeIST(start, end) {
  if (!(start instanceof Date)) start = parseContestTimeToUTC(start);
  if (!(end instanceof Date)) end = parseContestTimeToUTC(end);
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
  )}&dates=${start}/${end}&details=${encodeURIComponent(contest.url)}&sf=true&output=xml`;
}

export function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

// Always parse string as UTC-IST, for consistent display
function getDisplayDate(dateStr) {
  return parseContestTimeToUTC(dateStr);
}

export function contestToCalendarEvent(contest) {
  if (!contest) return null;
  const start = getDisplayDate(contest.startTime);
  const endOriginal = getDisplayDate(contest.endTime);

  let eventEnd = endOriginal;
  // If contest spans days, only show first day in calendar (for correct cell coloring)
  if (start.toDateString() !== endOriginal.toDateString()) {
    eventEnd = new Date(start);
    eventEnd.setDate(eventEnd.getDate() + 1);
    eventEnd.setHours(0, 0, 0, 0);
  }

  const event = {
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
      date: formatDateIST(start), // Always IST
      time: formatTimeRangeIST(start, endOriginal), // Always IST
      duration: formatDuration(endOriginal.getTime() - start.getTime()),
      status: getContestStatus(contest),
      platform: contest.platform,
      platformLogo: getContestLogoUrl(contest),
      url: contest.url,
      addToCalendarUrl: createAddToCalendarUrl(contest),
    },
  };

  return event;
}

export function contestsToCalendarEvents(contests = []) {
  return contests.map(contestToCalendarEvent).filter(Boolean);
}
