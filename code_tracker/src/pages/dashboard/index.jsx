import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import MetricCard from "./components/MetricCard";
import LineChart from "./components/LineChart";
import RadarChart from "./components/RadarChart";
import BarChart from "./components/BarChart";
import PlatformStatus from "./components/PlatformStatus";
import SkeletonCard from "./components/SkeletonCard";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data for the dashboard
  const mockDashboardData = {
    userStats: {
      totalProblemsSolved: 387,
      activeDays: 42,
      currentStreak: 7,
      longestStreak: 14
    },
    platforms: [
      { id: "leetcode", name: "LeetCode", isConnected: true, problemsSolved: 215, color: "var(--color-leetcode)" },
      { id: "codeforces", name: "Codeforces", isConnected: true, problemsSolved: 172, color: "var(--color-codeforces)" },
      { id: "hackerrank", name: "HackerRank", isConnected: false, problemsSolved: 0, color: "#2EC866" }
    ],
    progressData: [
      { date: "2023-06-01", leetcode: 180, codeforces: 140 },
      { date: "2023-07-01", leetcode: 190, codeforces: 145 },
      { date: "2023-08-01", leetcode: 195, codeforces: 150 },
      { date: "2023-09-01", leetcode: 200, codeforces: 155 },
      { date: "2023-10-01", leetcode: 205, codeforces: 160 },
      { date: "2023-11-01", leetcode: 210, codeforces: 165 },
      { date: "2023-12-01", leetcode: 215, codeforces: 172 }
    ],
    topicStrength: [
      { topic: "Arrays", score: 85 },
      { topic: "Strings", score: 75 },
      { topic: "Dynamic Programming", score: 60 },
      { topic: "Trees", score: 70 },
      { topic: "Graphs", score: 55 },
      { topic: "Sorting", score: 80 },
      { topic: "Searching", score: 75 },
      { topic: "Greedy", score: 65 }
    ],
    platformActivity: [
      { month: "Jun", leetcode: 12, codeforces: 8 },
      { month: "Jul", leetcode: 15, codeforces: 10 },
      { month: "Aug", leetcode: 10, codeforces: 12 },
      { month: "Sep", leetcode: 18, codeforces: 7 },
      { month: "Oct", leetcode: 14, codeforces: 9 },
      { month: "Nov", leetcode: 20, codeforces: 11 },
      { month: "Dec", leetcode: 16, codeforces: 13 }
    ],
    recentActivity: [
      {
        id: 1,
        platform: "leetcode",
        problemName: "Two Sum",
        difficulty: "Easy",
        timestamp: "2023-12-15T14:30:00Z",
        topics: ["Arrays", "Hash Table"]
      },
      {
        id: 2,
        platform: "codeforces",
        problemName: "Theatre Square",
        difficulty: "Medium",
        timestamp: "2023-12-14T18:45:00Z",
        topics: ["Math", "Greedy"]
      },
      {
        id: 3,
        platform: "leetcode",
        problemName: "Merge Two Sorted Lists",
        difficulty: "Easy",
        timestamp: "2023-12-13T10:15:00Z",
        topics: ["Linked List", "Recursion"]
      },
      {
        id: 4,
        platform: "leetcode",
        problemName: "Maximum Subarray",
        difficulty: "Medium",
        timestamp: "2023-12-12T16:20:00Z",
        topics: ["Arrays", "Dynamic Programming"]
      },
      {
        id: 5,
        platform: "codeforces",
        problemName: "Watermelon",
        difficulty: "Easy",
        timestamp: "2023-12-11T09:30:00Z",
        topics: ["Math", "Brute Force"]
      }
    ]
  };

  // Simulate data fetching
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      setHasError(false);
      
      // Simulate API call with timeout
      setTimeout(() => {
        try {
          setDashboardData(mockDashboardData);
          setLastUpdated(new Date());
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setHasError(true);
          setIsLoading(false);
        }
      }, 3000); // 3 second timeout to simulate loading
    };

    fetchData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = () => {
    setDashboardData(null);
    setIsLoading(true);
    setHasError(false);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        setDashboardData(mockDashboardData);
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error("Error refreshing dashboard data:", error);
        setHasError(true);
        setIsLoading(false);
      }
    }, 1500);
  };

  const formatLastUpdated = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Coding Progress Dashboard</h1>
            <p className="text-text-secondary mt-1">
              Track your coding practice across platforms
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <span className="text-sm text-text-secondary mr-3">
              Last updated: {formatLastUpdated(lastUpdated)}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-primary hover:bg-background disabled:opacity-50"
              aria-label="Refresh dashboard data"
            >
              <Icon 
                name="RefreshCw" 
                size={18} 
                className={isLoading ? "animate-spin" : ""} 
              />
            </button>
          </div>
        </div>
        
        {/* Platform Connection Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Connected Platforms</h2>
            <Link 
              to="/platform-connection"
              className="text-sm text-primary hover:text-primary-dark flex items-center"
            >
              <span>Manage connections</span>
              <Icon name="ExternalLink" size={14} className="ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="h-16 bg-surface rounded-lg animate-pulse"></div>
          ) : hasError ? (
            <div className="bg-surface border border-border rounded-lg p-4 text-center text-text-secondary">
              <p>Failed to load platform data</p>
            </div>
          ) : (
            <PlatformStatus platforms={dashboardData.platforms} />
          )}
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : hasError ? (
            <div className="col-span-full bg-surface border border-border rounded-lg p-4 text-center text-text-secondary">
              <p>Failed to load statistics</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 text-primary hover:text-primary-dark"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <MetricCard 
                title="Total Problems Solved" 
                value={dashboardData.userStats.totalProblemsSolved} 
                icon="CheckCircle" 
                trend="+12 this week" 
                trendUp={true}
              />
              <MetricCard 
                title="Active Days" 
                value={dashboardData.userStats.activeDays} 
                icon="Calendar" 
                trend="+3 this week" 
                trendUp={true}
              />
              <MetricCard 
                title="Current Streak" 
                value={dashboardData.userStats.currentStreak} 
                icon="Flame" 
                trend="days" 
                trendUp={null}
              />
              <MetricCard 
                title="Longest Streak" 
                value={dashboardData.userStats.longestStreak} 
                icon="Award" 
                trend="days" 
                trendUp={null}
              />
            </>
          )}
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Problem Solving Progress */}
          <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Problem Solving Progress</h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-xs text-text-secondary">
                  <span className="w-3 h-3 rounded-full bg-leetcode mr-1"></span>
                  LeetCode
                </span>
                <span className="inline-flex items-center text-xs text-text-secondary">
                  <span className="w-3 h-3 rounded-full bg-codeforces mr-1"></span>
                  Codeforces
                </span>
              </div>
            </div>
            
            <div className="h-64" aria-label="Problem solving progress over time">
              {isLoading ? (
                <div className="w-full h-full bg-background animate-pulse rounded"></div>
              ) : hasError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-text-secondary">
                    <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
                    <p>Failed to load chart data</p>
                  </div>
                </div>
              ) : (
                <LineChart data={dashboardData.progressData} />
              )}
            </div>
          </div>
          
          {/* Topic Strength Analysis */}
          <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Topic Strength Analysis</h2>
            <div className="h-64" aria-label="Topic strength analysis radar chart">
              {isLoading ? (
                <div className="w-full h-full bg-background animate-pulse rounded"></div>
              ) : hasError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-text-secondary">
                    <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
                    <p>Failed to load chart data</p>
                  </div>
                </div>
              ) : (
                <RadarChart data={dashboardData.topicStrength} />
              )}
            </div>
            <div className="mt-2 text-right">
              <Link 
                to="/topic-analysis"
                className="text-sm text-primary hover:text-primary-dark flex items-center justify-end"
              >
                <span>View detailed analysis</span>
                <Icon name="ArrowRight" size={14} className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Platform Activity Summary */}
          <div className="bg-surface border border-border rounded-lg p-4 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Platform Activity Summary</h2>
            <div className="h-64" aria-label="Platform activity summary bar chart">
              {isLoading ? (
                <div className="w-full h-full bg-background animate-pulse rounded"></div>
              ) : hasError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-text-secondary">
                    <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
                    <p>Failed to load chart data</p>
                  </div>
                </div>
              ) : (
                <BarChart data={dashboardData.platformActivity} />
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
            <button className="text-sm text-primary hover:text-primary-dark">
              View all
            </button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-background animate-pulse rounded"></div>
              ))}
            </div>
          ) : hasError ? (
            <div className="text-center text-text-secondary py-8">
              <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
              <p>Failed to load recent activity</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 text-primary hover:text-primary-dark"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${activity.platform === 'leetcode' ? 'bg-leetcode' : 'bg-codeforces'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-text-primary">{activity.problemName}</h3>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        activity.difficulty === 'Easy' ?'bg-success bg-opacity-10 text-success' 
                          : activity.difficulty === 'Medium' ?'bg-warning bg-opacity-10 text-warning' :'bg-error bg-opacity-10 text-error'
                      }`}>
                        {activity.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-text-secondary capitalize">{activity.platform}</span>
                      <span className="mx-1 text-text-tertiary">•</span>
                      <span className="text-xs text-text-secondary">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end">
                    {activity.topics.map((topic, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-background text-text-secondary px-2 py-1 rounded-full mr-1 mb-1"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
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