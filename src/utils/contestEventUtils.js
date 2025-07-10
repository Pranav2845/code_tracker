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

export function formatTimeRange(start, end) {
  const opts = { hour: "2-digit", minute: "2-digit" };
  return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
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

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

export function contestToCalendarEvent(contest) {
  if (!contest) return null;
  const start = new Date(contest.startTime);
  const endOriginal = new Date(contest.endTime);

  let eventEnd = endOriginal;
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
      date: formatDate(start),
      time: formatTimeRange(start, endOriginal),
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