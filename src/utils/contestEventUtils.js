// src/utils/contestEventUtils.js
import { getContestLogoUrl } from "./contestLogo.js";

export function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? "st"
      : day % 10 === 2 && day % 100 !== 12
      ? "nd"
      : day % 10 === 3 && day % 100 !== 13
      ? "rd"
      : "th";
  const month = date.toLocaleString("default", { month: "long" });
  return `${day}${suffix} ${month}, ${date.getFullYear()}`;
}

// Format a JS Date as "13th July, 2025" in IST
export function formatDateIST(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const dayNum = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric' }).format(date),
  );
  const suffix =
    dayNum % 10 === 1 && dayNum % 100 !== 11
      ? 'st'
      : dayNum % 10 === 2 && dayNum % 100 !== 12
      ? 'nd'
      : dayNum % 10 === 3 && dayNum % 100 !== 13
      ? 'rd'
      : 'th';
  const month = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'long' }).format(date);
  const year = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(date);
  return `${dayNum}${suffix} ${month}, ${year}`;
}

// Format as "08:00 PM - 09:30 PM" in IST
export function formatTimeRangeIST(start, end) {
  const opts = { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true };
  const fmt = new Intl.DateTimeFormat("en-US", opts);
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`;
}

export function getContestStatus(contest) {
  if (!contest) return "";
  return new Date(contest.endTime).getTime() > Date.now()
    ? "Upcoming"
    : "Contest Ended";
}

export function createAddToCalendarUrl(contest) {
  if (!contest) return '';
  const start = new Date(contest.startTime)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, '');
  const end = new Date(contest.endTime)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, '');
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

// Helper: for all platforms, always show IST (optional: restrict to leetcode only)
function getDisplayDate(dateStr) {
  return new Date(dateStr);
}

export function contestToCalendarEvent(contest) {
  if (!contest) return null;
  const start = getDisplayDate(contest.startTime);
  const endOriginal = getDisplayDate(contest.endTime);

  let eventEnd = endOriginal;
  if (start.toDateString() !== endOriginal.toDateString()) {
    eventEnd = new Date(start);
    eventEnd.setDate(eventEnd.getDate() + 1);
    eventEnd.setHours(0, 0, 0, 0);
  }

  // --- THIS is the important part ---
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
      // ALWAYS use IST for date and time display:
      date: formatDateIST(start),
      time: formatTimeRangeIST(start, endOriginal),
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
