import React from "react";

function generateInsights({ completionRate, averageDifficulty, successRate }) {
  const strengths = [];
  const weaknesses = [];

  if (completionRate >= 70) strengths.push("Great completion rate");
  else if (completionRate < 50) weaknesses.push("Low completion rate");

  if (successRate >= 70) strengths.push("High accuracy");
  else if (successRate < 50) weaknesses.push("Accuracy could improve");

  if (averageDifficulty === "Hard") strengths.push("Comfortable with hard problems");
  else if (averageDifficulty === "Easy") weaknesses.push("Try more medium or hard problems");

  const summary = [];
  if (strengths.length) summary.push(`Strengths: ${strengths.join(', ')}`);
  if (weaknesses.length) summary.push(`Weaknesses: ${weaknesses.join(', ')}`);
  if (summary.length === 0) summary.push("Keep practicing to build more data.");

  return summary;
}

const AIInsights = ({ stats }) => {
  const messages = generateInsights(stats);

  return (
    <div className="bg-surface rounded-lg shadow-sm p-6 mt-6">
      <h3 className="text-lg font-medium text-text-primary mb-2">AI Insights</h3>
      <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default AIInsights;