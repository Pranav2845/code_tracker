// File: src/pages/dashboard/components/recentActivity.jsx
import React from "react";
import Icon from "../../../components/AppIcon";

const RecentActivity = ({ activities, isLoading, hasError, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-16 bg-background animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center text-text-secondary py-8">
        <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
        <p>Failed to load recent activity</p>
        <button 
          onClick={onRefresh}
          className="mt-2 text-primary hover:text-primary-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {activities.map((activity) => (
        <div key={activity.id} className="py-3 flex items-center">
           <div
            className={`w-2 h-2 rounded-full mr-3 ${
              {
                leetcode: 'bg-leetcode',
                codeforces: 'bg-codeforces',
                hackerrank: 'bg-success',
                gfg: 'bg-gfg',
                codingninjas: 'bg-codingninjas',
                cses: 'bg-cses',
                codechef: 'bg-codechef'
              }[activity.platform] || 'bg-primary'
            }`}
          ></div>
          
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
  );
};

export default RecentActivity;