import React from "react";
import Icon from "../../../components/AppIcon";

const MetricCard = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
          <Icon name={icon} size={16} className="text-primary" />
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        {trend && (
          <div className="mt-1 flex items-center">
            {trendUp !== null && (
              <Icon 
                name={trendUp ? "TrendingUp" : "TrendingDown"} 
                size={14} 
                className={trendUp ? "text-success mr-1" : "text-error mr-1"} 
              />
            )}
            <span className={`text-xs ${
              trendUp === null 
                ? "text-text-secondary" 
                : trendUp 
                  ? "text-success" :"text-error"
            }`}>
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;