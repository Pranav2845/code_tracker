export function getContestLogoUrl(contest) {
  if (!contest) return '';
  let host = contest.host;
  if (!host && contest.url) {
    try {
      host = new URL(contest.url).hostname;
    } catch (err) {
      host = '';
    }
  }
  return host ? `https://logo.clearbit.com/${host}` : '';
}