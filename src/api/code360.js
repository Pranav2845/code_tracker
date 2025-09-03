// File: src/api/code360.js
import api from "./axios";

export async function fetchCode360ProfileTotalCount(username) {
  const { data } = await api.get(
    `/user/code360/count/${encodeURIComponent(username)}`
  );
  return data.totalCount;
}

export async function fetchCode360SolvedProblems(username) {
  const { data } = await api.get(
    `/user/code360/problems/${encodeURIComponent(username)}`
  );
  return Array.isArray(data.problems) ? data.problems : [];
}