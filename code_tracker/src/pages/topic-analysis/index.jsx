import React, { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import TopicSelector from "./components/TopicSelector";
import SummaryCard from "./components/SummaryCard";
import DifficultyChart from "./components/DifficultyChart";
import ProblemTable from "./components/ProblemTable";
import Icon from "../../components/AppIcon";

const TopicAnalysis = () => {
  const [selectedTopic, setSelectedTopic] = useState("Arrays");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for topics
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

  // Mock data for topic performance
  const topicPerformance = {
    "Arrays": {
      completionRate: 68,
      averageDifficulty: "Medium",
      successRate: 75,
      difficultyDistribution: {
        easy: { solved: 24, attempted: 30 },
        medium: { solved: 18, attempted: 25 },
        hard: { solved: 6, attempted: 12 },
      },
      problems: [
        { id: 1, name: "Two Sum", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-15", url: "https://leetcode.com/problems/two-sum/" },
        { id: 2, name: "Container With Most Water", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-12", url: "https://leetcode.com/problems/container-with-most-water/" },
        { id: 3, name: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-10", url: "https://leetcode.com/problems/trapping-rain-water/" },
        { id: 4, name: "Maximum Subarray", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-08", url: "https://leetcode.com/problems/maximum-subarray/" },
        { id: 5, name: "Merge Sorted Array", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-05", url: "https://leetcode.com/problems/merge-sorted-array/" },
        { id: 6, name: "3Sum", platform: "LeetCode", difficulty: "Medium", status: "Attempted", date: "2023-06-03", url: "https://leetcode.com/problems/3sum/" },
        { id: 7, name: "Array With Elements Not Equal to Average of Neighbors", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-01", url: "https://leetcode.com/problems/array-with-elements-not-equal-to-average-of-neighbors/" },
        { id: 8, name: "First Missing Positive", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-05-28", url: "https://leetcode.com/problems/first-missing-positive/" },
      ]
    },
    "Strings": {
      completionRate: 52,
      averageDifficulty: "Easy",
      successRate: 80,
      difficultyDistribution: {
        easy: { solved: 18, attempted: 20 },
        medium: { solved: 10, attempted: 15 },
        hard: { solved: 2, attempted: 8 },
      },
      problems: [
        { id: 9, name: "Valid Palindrome", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-14", url: "https://leetcode.com/problems/valid-palindrome/" },
        { id: 10, name: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-11", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
        { id: 11, name: "Regular Expression Matching", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-09", url: "https://leetcode.com/problems/regular-expression-matching/" },
        { id: 12, name: "String to Integer (atoi)", platform: "LeetCode", difficulty: "Medium", status: "Attempted", date: "2023-06-07", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
        { id: 13, name: "Valid Anagram", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-04", url: "https://leetcode.com/problems/valid-anagram/" },
      ]
    },
    "Linked Lists": {
      completionRate: 45,
      averageDifficulty: "Medium",
      successRate: 60,
      difficultyDistribution: {
        easy: { solved: 8, attempted: 10 },
        medium: { solved: 12, attempted: 20 },
        hard: { solved: 3, attempted: 10 },
      },
      problems: [
        { id: 14, name: "Reverse Linked List", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-13", url: "https://leetcode.com/problems/reverse-linked-list/" },
        { id: 15, name: "Add Two Numbers", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-10", url: "https://leetcode.com/problems/add-two-numbers/" },
        { id: 16, name: "Merge k Sorted Lists", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-08", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
      ]
    },
    "Trees": {
      completionRate: 38,
      averageDifficulty: "Medium",
      successRate: 65,
      difficultyDistribution: {
        easy: { solved: 10, attempted: 12 },
        medium: { solved: 8, attempted: 15 },
        hard: { solved: 2, attempted: 8 },
      },
      problems: [
        { id: 17, name: "Maximum Depth of Binary Tree", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-12", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
        { id: 18, name: "Binary Tree Level Order Traversal", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-09", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
        { id: 19, name: "Binary Tree Maximum Path Sum", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-07", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
      ]
    },
    "Graphs": {
      completionRate: 30,
      averageDifficulty: "Hard",
      successRate: 55,
      difficultyDistribution: {
        easy: { solved: 5, attempted: 8 },
        medium: { solved: 10, attempted: 18 },
        hard: { solved: 5, attempted: 12 },
      },
      problems: [
        { id: 20, name: "Number of Islands", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-11", url: "https://leetcode.com/problems/number-of-islands/" },
        { id: 21, name: "Course Schedule", platform: "LeetCode", difficulty: "Medium", status: "Attempted", date: "2023-06-08", url: "https://leetcode.com/problems/course-schedule/" },
        { id: 22, name: "Word Ladder", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-06", url: "https://leetcode.com/problems/word-ladder/" },
      ]
    },
    "Dynamic Programming": {
      completionRate: 25,
      averageDifficulty: "Hard",
      successRate: 45,
      difficultyDistribution: {
        easy: { solved: 4, attempted: 6 },
        medium: { solved: 8, attempted: 20 },
        hard: { solved: 4, attempted: 15 },
      },
      problems: [
        { id: 23, name: "Climbing Stairs", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-10", url: "https://leetcode.com/problems/climbing-stairs/" },
        { id: 24, name: "Coin Change", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-07", url: "https://leetcode.com/problems/coin-change/" },
        { id: 25, name: "Edit Distance", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-05", url: "https://leetcode.com/problems/edit-distance/" },
      ]
    },
    "Sorting & Searching": {
      completionRate: 70,
      averageDifficulty: "Medium",
      successRate: 85,
      difficultyDistribution: {
        easy: { solved: 15, attempted: 15 },
        medium: { solved: 12, attempted: 15 },
        hard: { solved: 3, attempted: 5 },
      },
      problems: [
        { id: 26, name: "Binary Search", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-09", url: "https://leetcode.com/problems/binary-search/" },
        { id: 27, name: "Search in Rotated Sorted Array", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-06", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
        { id: 28, name: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-04", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
      ]
    },
    "Greedy Algorithms": {
      completionRate: 55,
      averageDifficulty: "Medium",
      successRate: 70,
      difficultyDistribution: {
        easy: { solved: 8, attempted: 10 },
        medium: { solved: 10, attempted: 15 },
        hard: { solved: 2, attempted: 5 },
      },
      problems: [
        { id: 29, name: "Best Time to Buy and Sell Stock", platform: "LeetCode", difficulty: "Easy", status: "Solved", date: "2023-06-08", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
        { id: 30, name: "Jump Game", platform: "LeetCode", difficulty: "Medium", status: "Solved", date: "2023-06-05", url: "https://leetcode.com/problems/jump-game/" },
        { id: 31, name: "Candy", platform: "LeetCode", difficulty: "Hard", status: "Attempted", date: "2023-06-03", url: "https://leetcode.com/problems/candy/" },
      ]
    }
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    // Simulate refreshing data
    setTimeout(() => {
      setIsRefreshing(false);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const currentTopicData = topicPerformance[selectedTopic] || {
    completionRate: 0,
    averageDifficulty: "N/A",
    successRate: 0,
    difficultyDistribution: {
      easy: { solved: 0, attempted: 0 },
      medium: { solved: 0, attempted: 0 },
      hard: { solved: 0, attempted: 0 },
    },
    problems: []
  };

  const hasProblems = currentTopicData.problems.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-6">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Topic Analysis</h1>
              <p className="text-text-secondary mt-1">
                Analyze your performance across different coding topics
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh data"
            >
              <Icon 
                name={isRefreshing ? "Loader" : "RefreshCw"} 
                size={16} 
                className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              Refresh
            </button>
          </div>

          {/* Topic selector */}
          <TopicSelector 
            topics={topics} 
            selectedTopic={selectedTopic} 
            onTopicChange={handleTopicChange} 
            isLoading={isLoading}
          />

          {isLoading ? (
            <div className="space-y-6">
              {/* Skeleton loaders */}
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
              {/* Performance summary cards */}
              <SummaryCard 
                completionRate={currentTopicData.completionRate}
                averageDifficulty={currentTopicData.averageDifficulty}
                successRate={currentTopicData.successRate}
              />

              {/* Difficulty distribution chart */}
              <DifficultyChart 
                difficultyData={currentTopicData.difficultyDistribution} 
              />

              {/* Problem list */}
              {hasProblems ? (
                <ProblemTable problems={currentTopicData.problems} />
              ) : (
                <div className="bg-surface rounded-lg shadow-sm p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                      <Icon name="FileQuestion" size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary">No problems found</h3>
                    <p className="text-text-secondary max-w-md">
                      You haven't attempted any problems in this topic yet. Start solving problems to see your performance analysis.
                    </p>
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Browse Problems
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TopicAnalysis;