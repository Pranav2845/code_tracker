import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-background rounded w-24 animate-pulse"></div>
        <div className="w-8 h-8 rounded-full bg-background animate-pulse"></div>
      </div>
      
      <div className="mt-4">
        <div className="h-7 bg-background rounded w-16 animate-pulse"></div>
        <div className="mt-2 h-3 bg-background rounded w-20 animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;