// File: src/pages/dashboard/components/PlatformStatus.jsx
import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";

const PlatformStatus = ({ platforms }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {platforms.map((platform) => (
        <div 
          key={platform.id}
          className={`flex items-center p-4 rounded-lg border ${
            platform.isConnected 
              ? "bg-surface border-border" :"bg-background border-border border-dashed"
          }`}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              platform.isConnected 
                ? "bg-primary-50" :"bg-background border border-border"
            }`}
          >
            <Icon 
              name={platform.isConnected ? "Check" : "Link"} 
              size={18} 
              className={platform.isConnected ? "text-primary" : "text-text-tertiary"} 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-text-primary">{platform.name}</h3>
            {platform.isConnected ? (
              <p className="text-xs text-text-secondary mt-0.5">
                {platform.problemsSolved} problems solved
              </p>
            ) : (
              <p className="text-xs text-text-tertiary mt-0.5">
                Not connected
              </p>
            )}
          </div>
          
          {platform.isConnected ? (
            <button 
              className="text-xs text-text-secondary hover:text-text-primary p-1"
              aria-label={`Disconnect ${platform.name}`}
            >
              <Icon name="Unlink" size={14} />
            </button>
          ) : (
            <Link 
              to="/platform-connection"
              className="text-xs text-primary hover:text-primary-dark"
            >
              Connect
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlatformStatus;