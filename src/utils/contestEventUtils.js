import { getContestLogoUrl } from "./contestLogo.js";
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
      date: start.toLocaleDateString(),
      timeRange: `${formatTime(start)} - ${formatTime(endOriginal)}`,
      duration: formatDuration(endOriginal.getTime() - start.getTime()),
      platform: contest.platform,
      platformLogo: getContestLogoUrl(contest),
      status: contest.status,
      url: contest.url,
      addToCalendarUrl: createAddToCalendarUrl(contest),
    },
  };

  return event;
}

export function contestsToCalendarEvents(contests = []) {
  return contests.map(contestToCalendarEvent).filter(Boolean);
}