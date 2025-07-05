// File: src/pages/dashboard/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import MetricCard from "./components/MetricCard";
import PlatformTotalsChart from "./components/PlatformTotalsChart";
import RadarChart from "./components/RadarChart";
import BarChart from "./components/BarChart";
import PlatformStatus from "./components/PlatformStatus";
import SkeletonCard from "./components/SkeletonCard";
import EventTracker from "./components/EventTracker";

const Dashboard = () => {
  const [isLoading, setIsLoading]       = useState(true);
  const [hasError, setHasError]         = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(new Date());
  const [contests, setContests]         = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    try {
      const profileRes  = await axios.get("/user/profile");
      const connections = profileRes.data.platforms || {};

      const statsRes     = await axios.get("/user/stats");
      const problemsRes  = await axios.get("/problems");
      const analyticsRes = await axios.get("/user/analytics");
       const contestsRes  = await axios.get("/contests");
      const { totalSolved, byPlatform } = statsRes.data;
      
      const allProblems  = problemsRes.data;
      const {
        
        platformActivity: rawActivity,
        topicStrength: rawStrength,
      } = analyticsRes.data;

      const platformActivity = Array.isArray(rawActivity) &&
        rawActivity.every((d) => d && typeof d.month === 'string')
          ? rawActivity
          : [];

      const topicStrength = Array.isArray(rawStrength) &&
        rawStrength.every((t) => t && typeof t.topic === 'string' && typeof t.score === 'number')
          ? rawStrength
          : [];

      const upcomingContests = Array.isArray(contestsRes.data)
        ? contestsRes.data.slice(0, 5)
        : [];
      setContests(upcomingContests);


      // 3️⃣ Build the platforms array (now includes GFG, Code 360, CSES, CodeChef)
      const platforms = [
        { id: "leetcode",     name: "LeetCode",      color: "var(--color-leetcode)" },
        { id: "codeforces",   name: "Codeforces",    color: "var(--color-codeforces)" },
        { id: "hackerrank",   name: "HackerRank",    color: "var(--color-success)" },
        { id: "gfg",          name: "GeeksforGeeks", color: "var(--color-gfg)" },
        { id: "code360",      name: "Code 360 by Coding Ninjas", color: "var(--color-code360)" },
        { id: "cses",         name: "CSES",          color: "var(--color-cses)" },
        { id: "codechef",     name: "CodeChef",      color: "var(--color-codechef)" }
      ].map((p) => {
        const entry  = byPlatform.find(({ _id }) => _id === p.id);
        const solved = entry ? entry.count : 0;
        const handle = connections[p.id]?.handle || "";
        return { ...p, isConnected: !!handle, problemsSolved: solved };
      });
            // Build progress data based on total solved per platform
      const progressData = platforms.map((p) => ({
        platform: p.name,
        solved: p.problemsSolved,
        color: p.color,
      }));

      // 4️⃣ Recent activity (last 5 solves)
      const recentActivity = allProblems
        .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
        .slice(0, 5)
        .map((p) => ({
          id:          p._id,
          platform:    p.platform,
          problemName: p.title,
          difficulty:  p.difficulty,
          timestamp:   p.solvedAt,
          topics:      p.tags,
          url:         p.url || "#"
        }));


      // 5️⃣ Dashboard analytics
      setDashboardData({
        userStats: {
           totalProblemsSolved: totalSolved
        },
        platforms,
        progressData,
        topicStrength,
        platformActivity,
        recentActivity
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setHasError(true);
      setErrorMessage(err.response?.data?.message || "");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => fetchData();
  const formatTime = (d) =>
    new Intl.DateTimeFormat("en-US", {
      hour:   "numeric",
      minute: "numeric",
      hour12: true
    }).format(d);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Header */}
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
          {isLoading ? (
            <div className="h-16 bg-surface rounded animate-pulse" />
          ) : hasError ? (
            <div className="p-4 bg-surface border rounded text-text-secondary">
              {errorMessage || 'Failed to load platform data'}
            </div>
          ) : (
            <PlatformStatus platforms={dashboardData.platforms} />
          )}
        </div>

        {/* Stats Overview */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {isLoading ? (
            [0].map((_,i) => <SkeletonCard key={i} />)
          ) : hasError ? (
            <div className="col-span-full p-4 bg-surface border rounded text-center">
              {errorMessage || 'Failed to load stats'}
            </div>
          ) : (
            <>
              <MetricCard
                title="Total Problems Solved"
                value={dashboardData.userStats.totalProblemsSolved}
                icon="CheckCircle"
                trend="+12 this week"
                trendUp
              />
              
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Problem Solving Progress */}
          <div className="bg-surface border rounded p-4 shadow-sm">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Problem Solving Progress</h2>
              <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-leetcode rounded-full mr-1" />LeetCode
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-codeforces rounded-full mr-1" />Codeforces
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-success rounded-full mr-1" />HackerRank
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gfg rounded-full mr-1" />GFG
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-code360 rounded-full mr-1" />Code 360
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-cses rounded-full mr-1" />CSES
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-codechef rounded-full mr-1" />CodeChef
                </span>
              </div>
            </div>
            <div className="h-64">
              {isLoading ? (
                <div className="w-full h-full bg-background animate-pulse rounded" />
              ) : hasError ? (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  <Icon name="AlertTriangle" size={24} /> {errorMessage || 'Failed to load'}
                </div>
              ) : (
                 <PlatformTotalsChart data={dashboardData.progressData} />
              )}
            </div>
          </div>

          {/* Topic Strength Analysis */}
          <div className="bg-surface border rounded p-4 shadow-sm">
            <h2 className="font-semibold mb-4">Topic Strength Analysis</h2>
            <div className="h-64">
              {isLoading ? (
                <div className="w-full h-full bg-background animate-pulse rounded" />
              ) : hasError ? (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  <Icon name="AlertTriangle" size={24} /> {errorMessage || 'Failed to load'}
                </div>
              ) : (
                <RadarChart data={dashboardData.topicStrength} />
              )}
            </div>
            <div className="text-right mt-2">
              <Link to="/topic-analysis" className="text-sm text-primary flex items-center justify-end">
                View detailed analysis
                <Icon name="ArrowRight" size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Activity Summary */}
        <div className="bg-surface border rounded p-4 shadow-sm mb-6">
          <h2 className="font-semibold mb-4">Platform Activity Summary</h2>
          <div className="h-64">
            {isLoading ? (
              <div className="w-full h-full bg-background animate-pulse rounded" />
            ) : hasError ? (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <Icon name="AlertTriangle" size={24} /> {errorMessage || 'Failed to load'}
              </div>
            ) : (
              <BarChart data={dashboardData.platformActivity} />
            )}
          </div>
        </div>
              {/* Upcoming Contests */}
        <div className="mb-6">
          {isLoading ? (
            <div className="h-32 bg-background animate-pulse rounded" />
          ) : hasError ? (
            <div className="p-4 bg-surface border rounded text-text-secondary">
              {errorMessage || 'Failed to load contests'}
            </div>
          ) : (
            <EventTracker contests={contests} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border rounded p-4 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Recent Activity</h2>
            <button className="text-sm text-primary hover:underline">View all</button>
          </div>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-background animate-pulse rounded mb-2" />
            ))
          ) : hasError ? (
            <div className="text-center text-text-secondary py-8">
              <Icon name="AlertTriangle" size={24} /> {errorMessage || 'Failed to load'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {dashboardData.recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${
                      ({
                        leetcode:    "bg-leetcode",
                        codeforces:  "bg-codeforces",
                        hackerrank:  "bg-success",
                        gfg:         "bg-gfg",
                        code360:     "bg-code360",
                        cses:        "bg-cses",
                        codechef:    "bg-codechef"
                      }[act.platform] || "bg-primary")
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">{act.problemName}</h3>
                      <span
                        className={`ml-2 px-2 text-xs rounded-full ${
                          act.difficulty === "Easy"
                            ? "bg-success text-success"
                            : act.difficulty === "Medium"
                            ? "bg-warning text-warning"
                            : "bg-error text-error"
                        }`}
                      >
                        {act.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {new Date(act.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day:   "numeric"
                      })}
                    </div>
                  </div>
                  <a
                    href={act.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-primary"
                  >
                    <Icon name="ExternalLink" size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
