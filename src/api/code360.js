import axios from 'axios';

export async function fetchCode360ProfileTotalCount(username) {
  const { data } = await axios.get(`/user/code360/count/${encodeURIComponent(username)}`);
  return data.totalCount;
}