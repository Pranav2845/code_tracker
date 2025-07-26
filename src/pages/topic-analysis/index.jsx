// File: src/pages/topic-analysis/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/ui/Header";
import TopicSelector from "./components/TopicSelector";
import SummaryCard from "./components/SummaryCard";
import DifficultyChart from "./components/DifficultyChart";
import ProblemTable from "./components/ProblemTable";
import AIInsights from "./components/AIInsights";
import Icon from "../../components/AppIcon";

const TopicAnalysis = () => {
  const [selectedTopic, setSelectedTopic] = useState("Arrays");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [topicData, setTopicData] = useState({
    completionRate: 0,
    averageDifficulty: "N/A",
    successRate: 0,
    difficultyDistribution: { easy: {}, medium: {}, hard: {} },
    problems: [],
  });

  // Helper to derive summary from raw problems
  const computeTopicStats = (probs) => {
    const total = probs.length;
    const solvedCount = probs.filter((p) => p.status === "Solved").length;
    const completionRate = total ? Math.round((solvedCount / total) * 100) : 0;
    const successRate = total
      ? Math.round(
          (probs.filter((p) => p.status === "Solved").length / total) * 100
        )
      : 0;
    const avgDiff =
      probs.reduce(
        (sum, p) =>
          sum +
          (p.difficulty === "Easy"
            ? 1
            : p.difficulty === "Medium"
            ? 2
            : 3),
        0
      ) / (total || 1);
    const averageDifficulty =
      avgDiff < 1.5 ? "Easy" : avgDiff < 2.5 ? "Medium" : "Hard";

    const difficultyDistribution = {
      easy: { solved: 0, attempted: 0 },
      medium: { solved: 0, attempted: 0 },
      hard: { solved: 0, attempted: 0 },
    };
    probs.forEach((p) => {
      const key = p.difficulty.toLowerCase();
      difficultyDistribution[key].attempted++;
      if (p.status === "Solved") difficultyDistribution[key].solved++;
    });

    return { completionRate, averageDifficulty, successRate, difficultyDistribution };
  };

  const fetchTopic = async (topic) => {
    setIsLoading(true);
    try {
      // GET /problems?tags=topic
      const res = await axios.get("/problems", {
        params: { tags: topic },
      });
      const probs = res.data.map((p) => ({
        ...p,
        status: p.status || "Solved", // adapt to your API
      }));

      const stats = computeTopicStats(probs);
      setTopicData({ ...stats, problems: probs });
    } catch (err) {
      console.error("Error fetching topic data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic(selectedTopic);
  }, [selectedTopic]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTopic(selectedTopic).finally(() => setIsRefreshing(false));
  };

  const topics = [
    { id: "arrays", name: "Arrays" },
    { id: "strings", name: "Strings" },
    { id: "linked-lists", name: "Linked Lists" },
    { id: "trees", name: "Trees" },
    { id: "graphs", name: "Graphs" },
    { id: "dynamic-programming", name: "Dynamic Programming" },
    { id: "sorting", name: "Sorting & Searching" },
    { id: "greedy", name: "Greedy Algorithms" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Topic Analysis</h1>
            <p className="text-text-secondary mt-1">
              Analyze your performance across different coding topics
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              name={isRefreshing ? "Loader" : "RefreshCw"}
              size={16}
              className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <TopicSelector
          topics={topics}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-surface animate-pulse rounded-lg"></div>
              <div className="h-32 bg-surface animate-pulse rounded-lg"></div>
              <div className="h-32 bg-surface animate-pulse rounded-lg"></div>
            </div>
            <div className="h-80 bg-surface animate-pulse rounded-lg"></div>
            <div className="h-96 bg-surface animate-pulse rounded-lg"></div>
          </div>
        ) : (
          <>
            <SummaryCard
              completionRate={topicData.completionRate}
              averageDifficulty={topicData.averageDifficulty}
              successRate={topicData.successRate}
            />

            <DifficultyChart
              difficultyData={topicData.difficultyDistribution}
            />

                     <AIInsights
              stats={{
                completionRate: topicData.completionRate,
                averageDifficulty: topicData.averageDifficulty,
                successRate: topicData.successRate,
              }}
            />
 
            {topicData.problems.length > 0 ? (
              <ProblemTable problems={topicData.problems} />
            ) : (
              <div className="bg-surface rounded-lg shadow-sm p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                    <Icon name="FileQuestion" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary">
                    No problems found
                  </h3>
                  <p className="text-text-secondary max-w-md">
                    You haven’t attempted any problems in this topic yet.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TopicAnalysis;
