// File: src/pages/topic-analysis/components/SummaryCard.jsx
import React from "react";
import Icon from "../../../components/AppIcon";

const SummaryCard = ({ completionRate, averageDifficulty, successRate }) => {
  // Determine color for completion rate
  const getCompletionColor = (rate) => {
    if (rate >= 70) return "text-success";
    if (rate >= 40) return "text-warning";
    return "text-error";
  };

  // Determine color for success rate
  const getSuccessColor = (rate) => {
    if (rate >= 75) return "text-success";
    if (rate >= 50) return "text-warning";
    return "text-error";
  };

  // Determine icon for difficulty
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return { name: "Smile", color: "text-success" };
      case "Medium":
        return { name: "Meh", color: "text-warning" };
      case "Hard":
        return { name: "Frown", color: "text-error" };
      default:
        return { name: "HelpCircle", color: "text-text-tertiary" };
    }
  };

  const difficultyIcon = getDifficultyIcon(averageDifficulty);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Completion Rate Card */}
      <div className="bg-surface rounded-lg shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">Completion Rate</h3>
          <div className={`rounded-full p-1 ${getCompletionColor(completionRate)} bg-opacity-10`}>
            <Icon name="PieChart" size={16} className={getCompletionColor(completionRate)} />
          </div>
        </div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${getCompletionColor(completionRate)}`}>
            {completionRate}%
          </span>
          <span className="ml-2 text-sm text-text-tertiary">of problems completed</span>
        </div>
        <div className="mt-4 w-full bg-background rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getCompletionColor(completionRate)} bg-opacity-80`} 
            style={{ width: `${completionRate}%` }}
            aria-label={`${completionRate}% completion rate`}
          ></div>
        </div>
      </div>

      {/* Average Difficulty Card */}
      <div className="bg-surface rounded-lg shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">Average Difficulty</h3>
          <div className={`rounded-full p-1 ${difficultyIcon.color} bg-opacity-10`}>
            <Icon name={difficultyIcon.name} size={16} className={difficultyIcon.color} />
          </div>
        </div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${difficultyIcon.color}`}>
            {averageDifficulty}
          </span>
          <span className="ml-2 text-sm text-text-tertiary">level problems</span>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${averageDifficulty === "Easy" ? "bg-success" : "bg-background"}`}></div>
          <span className="text-xs text-text-tertiary">Easy</span>
          <div className={`h-2 w-2 rounded-full ${averageDifficulty === "Medium" ? "bg-warning" : "bg-background"}`}></div>
          <span className="text-xs text-text-tertiary">Medium</span>
          <div className={`h-2 w-2 rounded-full ${averageDifficulty === "Hard" ? "bg-error" : "bg-background"}`}></div>
          <span className="text-xs text-text-tertiary">Hard</span>
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="bg-surface rounded-lg shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">Success Rate</h3>
          <div className={`rounded-full p-1 ${getSuccessColor(successRate)} bg-opacity-10`}>
            <Icon name="Target" size={16} className={getSuccessColor(successRate)} />
          </div>
        </div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${getSuccessColor(successRate)}`}>
            {successRate}%
          </span>
          <span className="ml-2 text-sm text-text-tertiary">successful submissions</span>
        </div>
        <div className="mt-4 w-full bg-background rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getSuccessColor(successRate)} bg-opacity-80`} 
            style={{ width: `${successRate}%` }}
            aria-label={`${successRate}% success rate`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;