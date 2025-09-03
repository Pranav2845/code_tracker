// File: src/pages/dashboard/index.jsx
import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import api from "../../api/axios";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import MetricCard from "./components/MetricCard";
import PlatformStatus from "./components/PlatformStatus";
import SkeletonCard from "./components/SkeletonCard";

import { fetchCode360SolvedProblems } from "../../api/code360";
import { fetchCodeChefSolvedProblems } from "../../api/codechef";
import { fetchLeetCodeSolvedProblems } from "../../api/leetcode";
import { fetchGFGSolvedProblems } from "../../api/gfg";

// Lazy widgets
const PlatformTotalsChart = React.lazy(() =>
  import("./components/PlatformTotalsChart")
);
const TopicStrengthChart = React.lazy(() =>
  import("./components/TopicStrengthChart")
);

const CACHE_KEY = "dashboardCache:v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}
function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

/** Build external profile URL for each platform */
function profileUrlFor(platformId, handle) {
  if (!handle) return null;
  switch (platformId) {
    case "leetcode":
      return `https://leetcode.com/${handle}/`;
    case "codeforces":
      return `https://codeforces.com/profile/${handle}`;
    case "hackerrank":
      return `https://www.hackerrank.com/profile/${handle}`;
    case "gfg":
      return `https://auth.geeksforgeeks.org/user/${handle}/`;
    case "code360":
      return `https://www.codingninjas.com/studio/profile/${handle}`;
    case "codechef":
      return `https://www.codechef.com/users/${handle}`;

    default:
      return null;
  }
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [contests, setContests] = useState([]); // reserved if you display contests
  const abortRef = useRef(null);

  const isFirstLoad = isLoading && !dashboardData;

  const setDataOnce = (data) => {
    setDashboardData(data);
    setLastUpdated(new Date());
    setHasError(false);
    setErrorMessage("");
    writeCache(data);
  };

  const fetchData = async ({ background = false } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!background) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
    }

    try {
      const [profileRes, statsRes, problemsRes, analyticsRes, contestsRes] =
        await Promise.all([
          api.get("/user/profile", { signal: controller.signal }),
          api.get("/user/stats", { signal: controller.signal }),
          api.get("/problems", { signal: controller.signal }),
          api.get("/user/analytics", { signal: controller.signal }),
          api.get("/contests", { signal: controller.signal }),
          axios.get("/user/profile", { signal: controller.signal }),
          axios.get("/user/stats", { signal: controller.signal }),
          axios.get("/problems", { signal: controller.signal }),
          axios.get("/user/analytics", { signal: controller.signal }),
          axios.get("/contests", { signal: controller.signal }),
        ]);

      const connections = profileRes.data.platforms || {};
      const { totalSolved, byPlatform } = statsRes.data;
      let allProblems = problemsRes.data || [];
      const { platformActivity: rawActivity, topicStrength: rawStrength } =
        analyticsRes.data || {};

      const leetcodeHandle = connections.leetcode?.handle;
      const code360Handle = connections.code360?.handle;
      const codechefHandle = connections.codechef?.handle;
      const gfgHandle = connections.gfg?.handle;

      const [cnRes, ccRes, lcRes, gfgRes] = await Promise.allSettled([
        code360Handle
          ? fetchCode360SolvedProblems(code360Handle)
          : Promise.resolve(null),
        codechefHandle
          ? fetchCodeChefSolvedProblems(codechefHandle)
          : Promise.resolve(null),
        leetcodeHandle
          ? fetchLeetCodeSolvedProblems(leetcodeHandle)
          : Promise.resolve(null),
        gfgHandle ? fetchGFGSolvedProblems(gfgHandle) : Promise.resolve(null),
      ]);

      if (cnRes.status === "fulfilled" && Array.isArray(cnRes.value)) {
        const mapped = cnRes.value.map((p) => ({
          _id: p.id,
          platform: "code360",
          title: p.title,
          url: p.url || "#",
        }));
        allProblems = allProblems
          .filter((pr) => pr.platform !== "code360")
          .concat(mapped);
      }
      if (ccRes.status === "fulfilled" && Array.isArray(ccRes.value)) {
        const mapped = ccRes.value.map((p) => ({
          _id: p.id,
          platform: "codechef",
          title: p.title,
          url: p.url || "#",
        }));
        allProblems = allProblems
          .filter((pr) => pr.platform !== "codechef")
          .concat(mapped);
      }
      if (gfgRes.status === "fulfilled" && Array.isArray(gfgRes.value)) {
        const mapped = gfgRes.value.map((p) => ({
          _id: p.id,
          platform: "gfg",
          title: p.title,
          url: p.url || "#",
        }));
        allProblems = allProblems
          .filter((pr) => pr.platform !== "gfg")
          .concat(mapped);
      }
      if (lcRes.status === "fulfilled" && Array.isArray(lcRes.value)) {
        const mapped = lcRes.value.map((p) => ({
          _id: p.id,
          platform: "leetcode",
          title: p.title,
          url: p.url || "#",
        }));
        allProblems = allProblems
          .filter((pr) => pr.platform !== "leetcode")
          .concat(mapped);
      }

      const upcomingContests = Array.isArray(contestsRes.data?.upcoming)
        ? contestsRes.data.upcoming.slice(0, 5)
        : [];
      setContests(upcomingContests);

      // Platforms + icons
      const platformsMaster = [
        {
          id: "leetcode",
          name: "LeetCode",
          color: "var(--color-leetcode)",
          imageSrc: "/assets/images/leetcode.png",
        },
        {
          id: "codeforces",
          name: "Codeforces",
          color: "var(--color-codeforces)",
          imageSrc: "/assets/images/codeforces.png",
        },
        {
          id: "hackerrank",
          name: "HackerRank",
          color: "var(--color-success)",
          imageSrc: "/assets/images/hackerrank.webp",
        },
        {
          id: "gfg",
          name: "GeeksforGeeks",
          color: "var(--color-gfg)",
          imageSrc: "/assets/images/gfg.png",
        },
        {
          id: "code360",
          name: "Code 360 by Coding Ninjas",
          color: "var(--color-code360)",
          imageSrc: "/assets/images/codingninjas.jpeg",
        },
        {
          id: "codechef",
          name: "CodeChef",
          color: "var(--color-codechef)",
          imageSrc: "/assets/images/codechef.png",
        },
      ];

      const platforms = platformsMaster.map((p) => {
        const entry = byPlatform.find(({ _id }) => _id === p.id);
        const solved = entry ? entry.count : 0;
        const handle = (connections[p.id]?.handle || "").trim();
        return { ...p, isConnected: !!handle, problemsSolved: solved, handle };
      });

      const progressData = platforms.map((p) => ({
        platform: p.name,
        solved: p.problemsSolved,
        color: p.color,
      }));

      const problemsMap = allProblems.reduce((acc, prob) => {
        (acc[prob.platform] ||= []).push({
          id: prob._id,
          title: prob.title,
          url: prob.url || "#",
        });
        return acc;
      }, {});

      const platformActivity =
        Array.isArray(rawActivity) &&
        rawActivity.every((d) => d && typeof d.month === "string")
          ? rawActivity
          : [];
      const topicStrength =
        Array.isArray(rawStrength) &&
        rawStrength.every(
          (t) => t && typeof t.topic === "string" && typeof t.score === "number"
        )
          ? rawStrength
          : [];

      setDataOnce({
        userStats: { totalProblemsSolved: totalSolved },
        platforms,
        progressData,
        topicStrength,
        platformActivity,
        problemsMap,
      });
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("Error fetching dashboard data:", err);
      setHasError(true);
      setErrorMessage(err?.response?.data?.message || "Failed to load data");
    } finally {
      if (!background) setIsLoading(false);
    }
  };

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setDashboardData(cached);
      setIsLoading(false);
    }
    fetchData({ background: !!cached });

    const interval = setInterval(
      () => fetchData({ background: true }),
      5 * 60_000
    );
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleRefresh = () => fetchData({ background: false });
  const formatTime = (d) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(d);

  const connectedPlatforms = useMemo(
    () => dashboardData?.platforms?.filter((p) => p.isConnected) || [],
    [dashboardData]
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main
        className="flex-1 max-w-7xl mx-auto px-4 py-6"
        aria-busy={isFirstLoad}
        aria-live="polite"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Coding Progress Dashboard</h1>
            <p className="text-text-secondary mt-1">
              Track your coding practice across platforms
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-text-secondary">
              Last updated: {formatTime(lastUpdated)}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              title="Data updates every 5 minutes"
              className="p-2 rounded hover:bg-background disabled:opacity-50"
            >
              <Icon
                name="RefreshCw"
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Connected Platforms</h2>
            <Link
              to="/platform-connection"
              className="text-sm text-primary flex items-center"
            >
              Manage connections
              <Icon name="ExternalLink" size={14} className="ml-1" />
            </Link>
          </div>
          {isFirstLoad ? (
            <div className="h-16 bg-surface rounded animate-pulse" />
          ) : !dashboardData && hasError ? (
            <div className="p-4 bg-surface border rounded text-text-secondary">
              {errorMessage || "Failed to load platform data"}
            </div>
          ) : (
            <PlatformStatus platforms={dashboardData?.platforms || []} />
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {isFirstLoad ? (
            [0].map((_, i) => <SkeletonCard key={i} />)
          ) : !dashboardData && hasError ? (
            <div className="col-span-full p-4 bg-surface border rounded text-center">
              {errorMessage || "Failed to load stats"}
            </div>
          ) : (
            <MetricCard
              title="Total Problems Solved"
              value={dashboardData?.userStats?.totalProblemsSolved || 0}
              icon="CheckCircle"
              trend="+12 this week"
              trendUp
            />
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Progress */}
          <div className="bg-surface border rounded p-4 shadow-sm">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Problem Solving Progress</h2>
              <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                {(dashboardData?.platforms || []).map((p) => (
                  <span key={p.id} className="flex items-center">
                    <span
                      className="w-2 h-2 rounded-full mr-1 inline-block"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {isFirstLoad ? (
              <div className="h-64 w-full bg-background animate-pulse rounded" />
            ) : !dashboardData && hasError ? (
              <div className="h-64 flex items-center justify-center text-text-secondary">
                <Icon name="AlertTriangle" size={24} />{" "}
                {errorMessage || "Failed to load"}
              </div>
            ) : (
              <div className="h-64">
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-background animate-pulse rounded" />
                  }
                >
                  <PlatformTotalsChart
                    data={dashboardData?.progressData || []}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Topic Strength */}
          <div className="bg-surface border rounded p-4 shadow-sm">
            <h2 className="font-semibold mb-4">Topic Strength Analysis</h2>

            {isFirstLoad ? (
              <div className="h-64 w-full bg-background animate-pulse rounded" />
            ) : !dashboardData && hasError ? (
              <div className="h-64 flex items-center justify-center text-text-secondary">
                <Icon name="AlertTriangle" size={24} />{" "}
                {errorMessage || "Failed to load"}
              </div>
            ) : (
              <div className="h-64">
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-background animate-pulse rounded" />
                  }
                >
                  <TopicStrengthChart
                    topicStrength={dashboardData?.topicStrength || []}
                  />
                </Suspense>
              </div>
            )}

            <div className="text-right mt-2">
              <Link
                to="/topic-analysis"
                className="text-sm text-primary flex items-center justify-end"
              >
                View detailed analysis
                <Icon name="ArrowRight" size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Questions Solved by Platform */}
        <div className="mb-6">
          {isFirstLoad ? (
            <div className="h-32 bg-background animate-pulse rounded" />
          ) : !dashboardData && hasError ? (
            <div className="p-4 bg-surface border rounded text-text-secondary">
              {errorMessage || "Failed to load problems"}
            </div>
          ) : (
            <section>
              <h2 className="text-lg font-semibold mb-4">
                Solved Problem Insights
              </h2>
              {connectedPlatforms.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  Connect a platform to see solved problems.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connectedPlatforms.map((p) => {
                    const problems = dashboardData?.problemsMap?.[p.id] || [];
                    const profileUrl = profileUrlFor(p.id, p.handle);

                    return (
                      <div
                        key={p.id}
                        className="bg-surface border rounded-lg p-5 shadow-sm flex flex-col h-80 md:h-96"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-medium flex items-center">
                            <img
                              src={p.imageSrc}
                              alt={p.name}
                              className="w-8 h-8 object-contain mr-2" // ⬅️ increased size
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />

                            {profileUrl ? (
                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-800 hover:text-gray-600 
             dark:text-white dark:hover:text-gray-200 
             dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] 
             transition-colors text-base"
                                title={`Open ${p.name} profile`}
                              >
                                {p.name}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-900 dark:text-white">
                                {p.name}
                              </span>
                            )}
                          </span>

                          <span className="text-3xl font-extrabold text-text-primary">
                            {p.problemsSolved}
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto mt-3">
                          {problems.length === 0 ? (
                            <p className="text-sm text-text-secondary">
                              No problems solved yet.
                            </p>
                          ) : (
                            <ul className="space-y-1 text-sm list-disc list-inside">
                              {problems.map((q) => (
                                <li key={q.id} className="truncate">
                                  <a
                                    href={q.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {q.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* First-load overlay */}
      {isFirstLoad && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <div
            className="flex items-center gap-3 text-text-primary"
            role="status"
            aria-live="polite"
          >
            <svg
              className="animate-spin h-6 w-6 text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="font-medium">Loading…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
